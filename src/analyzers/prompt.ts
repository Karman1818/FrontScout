import { TechnicalAuditResult } from '../types/audit.js';

export function buildVisionPrompt(technicalData: TechnicalAuditResult): string {
  const mobLayout = technicalData.viewports.mobile.layout;
  const culpritSummary = mobLayout.culpritElements?.length
    ? mobLayout.culpritElements.map((c) => `${c.selector} (scrollWidth: ${c.scrollWidth}px vs viewport: ${c.viewportWidth}px)`).join(', ')
    : 'None detected';

  const consoleErrorsSummary = technicalData.consoleErrors.length
    ? technicalData.consoleErrors.map((e) => `[${e.type.toUpperCase()}] ${e.text} (${e.location?.url || 'unknown'})`).join('\n')
    : 'No console errors';

  const httpErrorsSummary = technicalData.httpErrors.length
    ? technicalData.httpErrors.map((h) => `[HTTP ${h.status} ${h.statusText}] ${h.method} ${h.url} (${h.resourceType})`).join('\n')
    : 'No HTTP errors >= 400';

  return `You are a Senior Frontend Engineer and Visual UX/Conversion Rate Optimization (CRO) Auditor.
You are evaluating a website to identify technical, visual, and UX defects for high-value cold outreach.

Attached Images:
1. Desktop Viewport Screenshot (Above the fold, 1920x1080)
2. Mobile Viewport Screenshot (Above the fold, Pixel 7 emulation: 412x839)

Technical Telemetry collected from the live browser session:
- Target URL: ${technicalData.url}
- Mobile Horizontal Scroll: ${mobLayout.hasHorizontalScroll ? `YES (overflows by +${mobLayout.overflowAmount}px)` : 'NO'}
- Culprit Overflows: ${culpritSummary}
- Console Errors:
${consoleErrorsSummary}
- HTTP Errors (>= 400):
${httpErrorsSummary}

Your Mission:
Carefully inspect both screenshots and synthesize with the technical telemetry.
Focus specifically on:
1. Visual bugs: Overlapping elements, clipped or truncated copy, obscured CTA buttons, misaligned hero components.
2. Mobile touch & layout: Tap targets too small on touch screens (< 48x48px), cramped buttons, horizontal viewport overflow.
3. Readability & Contrast: Insufficient color contrast between text and background, illegible font sizes.
4. Broken functionality hinted by runtime console or 404 network errors.

Identify the TOP 3 MOST CRITICAL issues that damage credibility, conversion rate, or user experience.

Return ONLY a valid JSON object matching this exact TypeScript structure (do not wrap in markdown \`\`\`json fences, just raw JSON):

{
  "summary": "Concise 1-2 sentence overview of the website visual & technical state.",
  "topIssues": [
    {
      "id": "issue-1",
      "title": "Clear, punchy title describing the specific defect",
      "category": "layout | cta | typography | contrast | mobile-ux | console | network",
      "severity": "critical | high | medium",
      "impact": "Concrete explanation of how this hurts conversions, sales, or usability",
      "technicalProof": "Exact visual location or code/network log proving the issue",
      "codeFix": {
        "language": "css | javascript | html",
        "snippet": "Production-ready CSS/JS/HTML code snippet that fixes the problem",
        "explanation": "Brief explanation of why this fix works"
      }
    }
  ],
  "outreachEmail": {
    "subject": "Compelling, non-spammy subject line for cold email (e.g. Quick question regarding [Brand] mobile CTA layout)",
    "bodySnippet": "2-3 personalized, punchy sentences for a cold email to the site owner/marketing lead. Highlight one of the top friction points discovered above and suggest how fixing it will boost conversions."
  }
}`;
}
