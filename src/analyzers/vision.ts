import fs from 'node:fs/promises';
import { GoogleGenAI } from '@google/genai';
import { TechnicalAuditResult } from '../types/audit.js';
import { FinalAuditReport } from '../types/report.js';
import { buildVisionPrompt } from './prompt.js';
import { logger } from '../utils/logger.js';

interface RawVisionResponse {
  summary: string;
  topIssues: any[];
  outreachEmail: {
    subject: string;
    bodySnippet: string;
  };
}

export class VisionAnalyzer {
  private apiKey: string | undefined;
  private configuredModel: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY?.trim();
    this.configuredModel = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  async analyze(technicalData: TechnicalAuditResult): Promise<FinalAuditReport | null> {
    if (!this.isConfigured()) {
      logger.warn('Gemini API key is not configured (GEMINI_API_KEY in .env). Skipping AI analysis.');
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const prompt = buildVisionPrompt(technicalData);

    const desktopScreenshotPath = technicalData.viewports.desktop.screenshotFoldPath;
    const mobileScreenshotPath = technicalData.viewports.mobile.screenshotFoldPath;

    let desktopBase64 = '';
    let mobileBase64 = '';

    try {
      const [desktopBuf, mobileBuf] = await Promise.all([
        fs.readFile(desktopScreenshotPath),
        fs.readFile(mobileScreenshotPath),
      ]);
      desktopBase64 = desktopBuf.toString('base64');
      mobileBase64 = mobileBuf.toString('base64');
    } catch (err: any) {
      logger.warn(`Could not read screenshot files for AI analysis: ${err.message}`);
      return null;
    }

    const contents = [
      prompt,
      {
        inlineData: {
          mimeType: 'image/png',
          data: desktopBase64,
        },
      },
      {
        inlineData: {
          mimeType: 'image/png',
          data: mobileBase64,
        },
      },
    ];

    // Attempt generation with configured model first
    let activeModel = this.configuredModel;
    let responseText = '';

    try {
      logger.updateSpinner(`Consulting Gemini Vision (${activeModel})...`);
      const response = await ai.models.generateContent({
        model: activeModel,
        contents,
      });

      responseText = response.text || '';
    } catch (primaryErr: any) {
      const errMsg = primaryErr.message || String(primaryErr);

      // Check if error is related to unsupported/not found model name
      const isNotFound = /not found|404|unsupported/i.test(errMsg);

      if (isNotFound && activeModel !== 'gemini-2.5-flash') {
        logger.warn(`Model "${activeModel}" was not found or not available. Attempting fallback to "gemini-2.5-flash"...`);
        try {
          activeModel = 'gemini-2.5-flash';
          logger.updateSpinner(`Consulting Gemini Vision fallback (${activeModel})...`);
          const fallbackResponse = await ai.models.generateContent({
            model: activeModel,
            contents,
          });
          responseText = fallbackResponse.text || '';
        } catch (fallbackErr: any) {
          logger.warn(`Gemini Vision fallback also failed: ${fallbackErr.message || fallbackErr}. Proceeding with technical audit only.`);
          return null;
        }
      } else {
        logger.warn(`Gemini Vision API request failed: ${errMsg}. Proceeding with technical audit only.`);
        return null;
      }
    }

    if (!responseText) {
      logger.warn('Gemini Vision returned an empty response. Proceeding with technical audit only.');
      return null;
    }

    // Parse JSON output safely (strip markdown fences if model included them)
    try {
      const cleanJson = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed: RawVisionResponse = JSON.parse(cleanJson);

      const finalReport: FinalAuditReport = {
        url: technicalData.url,
        auditTimestamp: new Date().toISOString(),
        modelUsed: activeModel,
        summary: parsed.summary || 'Visual and frontend audit completed.',
        topIssues: Array.isArray(parsed.topIssues) ? parsed.topIssues.slice(0, 3) : [],
        outreachEmail: {
          subject: parsed.outreachEmail?.subject || 'Quick UX feedback on your website',
          bodySnippet: parsed.outreachEmail?.bodySnippet || '',
        },
        technicalData,
      };

      return finalReport;
    } catch (parseErr: any) {
      logger.warn(`Failed to parse Gemini Vision JSON response: ${parseErr.message}. Raw text saved in technical data.`);
      return null;
    }
  }
}
