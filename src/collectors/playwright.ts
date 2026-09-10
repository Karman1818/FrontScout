import { chromium, Browser, devices, Page } from 'playwright';
import {
  ConsoleIssue,
  HttpError,
  PageException,
  TechnicalAuditResult,
  ViewportAudit,
  AuditOptions,
} from '../types/audit.js';
import { AuditPaths, saveJsonFile } from '../utils/fileSystem.js';
import { detectLayoutIssues } from './layout.js';
import { logger } from '../utils/logger.js';

export class PlaywrightCollector {
  private browser: Browser | null = null;

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async runAudit(
    targetUrl: string,
    paths: AuditPaths,
    options: AuditOptions = {}
  ): Promise<TechnicalAuditResult> {
    const startTime = Date.now();
    const timeoutMs = options.timeoutMs ?? 30000;

    await this.init();
    if (!this.browser) {
      throw new Error('Playwright browser could not be initialized.');
    }

    const consoleErrors: ConsoleIssue[] = [];
    const pageExceptions: PageException[] = [];
    const httpErrors: HttpError[] = [];

    // Helper to attach event listeners to a page
    const attachListeners = (page: Page) => {
      page.on('console', (msg) => {
        const msgType = msg.type();
        if (msgType === 'error' || msgType === 'warning') {
          const location = msg.location();
          consoleErrors.push({
            type: msgType,
            text: msg.text(),
            location: location
              ? {
                  url: location.url,
                  lineNumber: location.lineNumber,
                  columnNumber: location.columnNumber,
                }
              : undefined,
            timestamp: new Date().toISOString(),
          });
        }
      });

      page.on('pageerror', (err) => {
        pageExceptions.push({
          message: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
        });
      });

      page.on('response', (response) => {
        const status = response.status();
        if (status >= 400) {
          const req = response.request();
          httpErrors.push({
            url: response.url(),
            method: req.method(),
            status,
            statusText: response.statusText(),
            resourceType: req.resourceType(),
            timestamp: new Date().toISOString(),
          });
        }
      });
    };

    let finalUrl = targetUrl;

    // --- 1. Desktop Audit ---
    logger.updateSpinner(`Auditing Desktop viewport (1920x1080)...`);
    const desktopContext = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 FrontScout/1.0',
    });

    const desktopPage = await desktopContext.newPage();
    attachListeners(desktopPage);

    try {
      const response = await desktopPage.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: timeoutMs,
      });

      if (response) {
        finalUrl = response.url();
      }

      // Allow idle network stabilization up to 3s
      await desktopPage.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {
        // networkidle timeout is expected on sites with continuous polling / streaming
      });

      // Desktop screenshots
      await desktopPage.screenshot({
        path: paths.desktopFoldPng,
        fullPage: false,
      });
      await desktopPage.screenshot({
        path: paths.desktopFullPng,
        fullPage: true,
      });

      const desktopLayout = await detectLayoutIssues(desktopPage);

      var desktopAudit: ViewportAudit = {
        viewport: 'desktop',
        viewportSize: { width: 1920, height: 1080 },
        screenshotFoldPath: paths.desktopFoldPng,
        screenshotFullPath: paths.desktopFullPng,
        layout: desktopLayout,
      };
    } finally {
      await desktopContext.close();
    }

    // --- 2. Mobile Audit ---
    logger.updateSpinner(`Auditing Mobile viewport (Pixel 7 emulation)...`);
    const pixel7 = devices['Pixel 7'] || {
      viewport: { width: 412, height: 915 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 FrontScout/1.0',
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    };

    const mobileContext = await this.browser.newContext({
      ...pixel7,
    });

    const mobilePage = await mobileContext.newPage();
    attachListeners(mobilePage);

    try {
      await mobilePage.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: timeoutMs,
      });

      await mobilePage.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {
        // networkidle timeout fallback
      });

      // Mobile screenshots
      await mobilePage.screenshot({
        path: paths.mobileFoldPng,
        fullPage: false,
      });
      await mobilePage.screenshot({
        path: paths.mobileFullPng,
        fullPage: true,
      });

      const mobileLayout = await detectLayoutIssues(mobilePage);

      var mobileAudit: ViewportAudit = {
        viewport: 'mobile',
        deviceName: 'Pixel 7',
        viewportSize: pixel7.viewport,
        screenshotFoldPath: paths.mobileFoldPng,
        screenshotFullPath: paths.mobileFullPng,
        layout: mobileLayout,
      };
    } finally {
      await mobileContext.close();
    }

    const durationMs = Date.now() - startTime;

    const result: TechnicalAuditResult = {
      url: targetUrl,
      finalUrl,
      timestamp: new Date().toISOString(),
      durationMs,
      consoleErrors,
      pageExceptions,
      httpErrors,
      viewports: {
        desktop: desktopAudit,
        mobile: mobileAudit,
      },
      outputDirectory: paths.rootDir,
    };

    // Save technical audit report to JSON
    await saveJsonFile(paths.technicalAuditJson, result);

    return result;
  }
}
