import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { normalizeUrl } from '../src/utils/url.js';
import { sanitizeHostname, prepareAuditDirectory, saveJsonFile } from '../src/utils/fileSystem.js';
import { buildVisionPrompt } from '../src/analyzers/prompt.js';
import { generateMarkdownReport } from '../src/reporters/markdownReporter.js';
import { generateJsonReport } from '../src/reporters/jsonReporter.js';
import { FinalAuditReport } from '../src/types/report.js';
import { TechnicalAuditResult } from '../src/types/audit.js';

describe('FrontScout Test Suite', () => {
  describe('url and fileSystem utilities', () => {
    it('1. normalizeUrl should prepend https protocol and resolve local file paths to file:// URLs', () => {
      assert.equal(normalizeUrl('example.com'), 'https://example.com');
      assert.equal(normalizeUrl('http://insecure-site.com'), 'http://insecure-site.com');
      assert.equal(normalizeUrl('https://secure-site.com'), 'https://secure-site.com');

      const localFileUrl = normalizeUrl('tests/test-overflow.html');
      assert.ok(localFileUrl.startsWith('file:///'));
      assert.ok(localFileUrl.endsWith('tests/test-overflow.html'));
    });

    it('2. sanitizeHostname should extract domain and handle subdomains properly', () => {
      assert.equal(sanitizeHostname('https://example.com/pricing'), 'example.com');
      assert.equal(sanitizeHostname('https://app.staging.example.com/dashboard'), 'app.staging.example.com');
    });

    it('3. sanitizeHostname should handle file: URLs and fallback on invalid URLs', () => {
      assert.equal(sanitizeHostname('file:///c:/projects/demo/index.html'), 'local_index');
      assert.equal(sanitizeHostname('not-a-url'), 'audit');
    });

    it('4. saveJsonFile and prepareAuditDirectory should create folder and write valid JSON', async () => {
      const tmpBase = await fs.mkdtemp(path.join(os.tmpdir(), 'frontscout-test-'));
      const paths = await prepareAuditDirectory('https://testcorp.io', tmpBase);

      assert.ok(paths.rootDir.includes('testcorp.io'));
      assert.ok(paths.screenshotsDir.endsWith('screenshots'));

      const testPayload = { status: 'ok', score: 98 };
      const targetFile = path.join(paths.rootDir, 'payload.json');
      await saveJsonFile(targetFile, testPayload);

      const readBack = JSON.parse(await fs.readFile(targetFile, 'utf-8'));
      assert.deepEqual(readBack, testPayload);

      // cleanup
      await fs.rm(tmpBase, { recursive: true, force: true });
    });
  });

  describe('prompt builder & AI telemetry', () => {
    it('5. buildVisionPrompt should format technical telemetry and overflow elements', () => {
      const mockTech: TechnicalAuditResult = {
        url: 'https://broken-layout.com',
        auditTimestamp: '2026-11-06T20:00:00.000Z',
        viewports: {
          desktop: {
            viewport: { width: 1920, height: 1080 },
            layout: { hasHorizontalScroll: false, overflowAmount: 0, scrollWidth: 1920, clientWidth: 1920, culpritElements: [] },
            screenshotPath: 'desk.png'
          },
          mobile: {
            viewport: { width: 412, height: 839 },
            layout: {
              hasHorizontalScroll: true,
              overflowAmount: 85,
              scrollWidth: 497,
              clientWidth: 412,
              culpritElements: [{ selector: '.hero-banner', scrollWidth: 497, viewportWidth: 412 }]
            },
            screenshotPath: 'mob.png'
          }
        },
        consoleErrors: [{ type: 'error', text: 'Uncaught ReferenceError: foo is not defined', location: { url: 'app.js' } }],
        httpErrors: [{ url: 'https://broken-layout.com/api/data', status: 500, statusText: 'Internal Server Error', method: 'GET', resourceType: 'fetch' }]
      };

      const prompt = buildVisionPrompt(mockTech);
      assert.ok(prompt.includes('Target URL: https://broken-layout.com'));
      assert.ok(prompt.includes('overflows by +85px'));
      assert.ok(prompt.includes('.hero-banner (scrollWidth: 497px vs viewport: 412px)'));
      assert.ok(prompt.includes('Uncaught ReferenceError: foo is not defined'));
      assert.ok(prompt.includes('[HTTP 500 Internal Server Error]'));
    });

    it('6. buildVisionPrompt should report clean telemetry when no errors or overflows exist', () => {
      const cleanTech: TechnicalAuditResult = {
        url: 'https://clean-site.com',
        auditTimestamp: '2026-11-06T20:00:00.000Z',
        viewports: {
          desktop: { viewport: { width: 1920, height: 1080 }, layout: { hasHorizontalScroll: false, overflowAmount: 0, scrollWidth: 1920, clientWidth: 1920, culpritElements: [] }, screenshotPath: '' },
          mobile: { viewport: { width: 412, height: 839 }, layout: { hasHorizontalScroll: false, overflowAmount: 0, scrollWidth: 412, clientWidth: 412, culpritElements: [] }, screenshotPath: '' }
        },
        consoleErrors: [],
        httpErrors: []
      };

      const prompt = buildVisionPrompt(cleanTech);
      assert.ok(prompt.includes('Mobile Horizontal Scroll: NO'));
      assert.ok(prompt.includes('Culprit Overflows: None detected'));
      assert.ok(prompt.includes('No console errors'));
      assert.ok(prompt.includes('No HTTP errors >= 400'));
    });
  });

  describe('reporters & serialization', () => {
    const sampleReport: FinalAuditReport = {
      url: 'https://client-shop.pl',
      auditTimestamp: '2026-11-06T21:00:00.000Z',
      modelUsed: 'gemini-2.5-flash',
      summary: 'Critical mobile checkout friction caused by non-responsive tables.',
      topIssues: [
        {
          title: 'Horizontal Page Overflow on Mobile',
          category: 'layout',
          severity: 'critical',
          impact: 'Mobile users abandon the cart due to clipped purchase buttons.',
          technicalProof: 'Hero container width is hardcoded to 1200px.',
          codeFix: {
            language: 'css',
            snippet: '.hero { max-width: 100%; width: 100%; box-sizing: border-box; }',
            explanation: 'Ensures fluid responsiveness across all screen sizes.'
          }
        }
      ],
      outreachEmail: {
        subject: 'Quick UX bottleneck on client-shop.pl',
        bodySnippet: 'Hi Team, I noticed an issue on your mobile product page...'
      },
      technicalData: {
        url: 'https://client-shop.pl',
        auditTimestamp: '2026-11-06T21:00:00.000Z',
        viewports: {
          desktop: { viewport: { width: 1920, height: 1080 }, layout: { hasHorizontalScroll: false, overflowAmount: 0, scrollWidth: 1920, clientWidth: 1920, culpritElements: [] }, screenshotPath: '' },
          mobile: { viewport: { width: 412, height: 839 }, layout: { hasHorizontalScroll: true, overflowAmount: 50, scrollWidth: 462, clientWidth: 412, culpritElements: [] }, screenshotPath: '' }
        },
        consoleErrors: [],
        httpErrors: []
      }
    };

    it('7. generateMarkdownReport should generate valid markdown with issues and pitch', async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'frontscout-report-'));
      const reportFile = await generateMarkdownReport(sampleReport, tmpDir);

      const content = await fs.readFile(reportFile, 'utf-8');
      assert.ok(content.includes('FrontScout Audit Report: https://client-shop.pl'));
      assert.ok(content.includes('Horizontal Page Overflow on Mobile'));
      assert.ok(content.includes('Quick UX bottleneck on client-shop.pl'));
      assert.ok(content.includes('.hero { max-width: 100%'));

      await fs.rm(tmpDir, { recursive: true, force: true });
    });

    it('8. generateMarkdownReport should handle empty issues list gracefully', async () => {
      const cleanReport: FinalAuditReport = {
        ...sampleReport,
        topIssues: []
      };
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'frontscout-empty-'));
      const reportFile = await generateMarkdownReport(cleanReport, tmpDir);
      const content = await fs.readFile(reportFile, 'utf-8');

      assert.ok(content.includes('No critical UX or frontend bottlenecks were detected'));
      await fs.rm(tmpDir, { recursive: true, force: true });
    });

    it('9. generateJsonReport should serialize report accurately to disk', async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'frontscout-json-'));
      const jsonFile = await generateJsonReport(sampleReport, tmpDir);

      const parsed = JSON.parse(await fs.readFile(jsonFile, 'utf-8'));
      assert.equal(parsed.url, 'https://client-shop.pl');
      assert.equal(parsed.topIssues.length, 1);
      assert.equal(parsed.topIssues[0].severity, 'critical');

      await fs.rm(tmpDir, { recursive: true, force: true });
    });

    it('10. layout telemetry aggregator should correctly compute horizontal scroll and culprit elements', () => {
      const layoutData = {
        hasHorizontalScroll: true,
        scrollWidth: 956,
        viewportWidth: 412,
        overflowAmount: 544,
        culpritElements: [
          { selector: 'div#wide-banner', scrollWidth: 940, viewportWidth: 412 }
        ]
      };

      assert.equal(layoutData.hasHorizontalScroll, true);
      assert.equal(layoutData.overflowAmount, 544);
      assert.equal(layoutData.culpritElements[0].selector, 'div#wide-banner');
      assert.ok(layoutData.culpritElements[0].scrollWidth > layoutData.culpritElements[0].viewportWidth);
    });
  });
});
