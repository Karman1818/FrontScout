import fs from 'node:fs/promises';
import path from 'node:path';
import { FinalAuditReport } from '../types/report.js';

export async function generateMarkdownReport(
  report: FinalAuditReport,
  outputDir: string
): Promise<string> {
  const filePath = path.join(outputDir, 'report.md');
  const { technicalData, topIssues, outreachEmail } = report;
  const mobLayout = technicalData.viewports.mobile.layout;

  let issuesMd = '';

  if (topIssues.length === 0) {
    issuesMd = '> No critical UX or frontend bottlenecks were detected by the visual auditor.\n\n';
  } else {
    topIssues.forEach((issue, idx) => {
      issuesMd += `### #${idx + 1} - ${issue.title}\n\n`;
      issuesMd += `- **Category:** \`${issue.category.toUpperCase()}\`\n`;
      issuesMd += `- **Severity:** \`${issue.severity.toUpperCase()}\`\n`;
      issuesMd += `- **Business & CRO Impact:** ${issue.impact}\n\n`;
      issuesMd += `#### 🔍 Technical Proof\n${issue.technicalProof}\n\n`;
      issuesMd += `#### 🛠️ Proposed Code Fix\n\`\`\`${issue.codeFix.language}\n${issue.codeFix.snippet}\n\`\`\`\n*${issue.codeFix.explanation}*\n\n---\n\n`;
    });
  }

  const content = `# ⚡ FrontScout Audit Report: ${report.url}

> Generated on: **${new Date(report.auditTimestamp).toUTCString()}**  
> AI Vision Engine: **${report.modelUsed}**

---

## 📌 Executive Summary
${report.summary}

---

## 🚨 Top Critical Friction Points (Conversion & UX)

${issuesMd}

## ✉️ Ready-to-Send Cold Outreach Pitch

Copy and paste this personalized icebreaker into your cold outreach email:

> **Subject:** ${outreachEmail.subject}
>
> ${outreachEmail.bodySnippet.replace(/\n/g, '\n> ')}

---

## 📊 Technical Snapshot

| Metric | Result |
| :--- | :--- |
| **Final URL** | \`${technicalData.finalUrl}\` |
| **Audit Duration** | \`${(technicalData.durationMs / 1000).toFixed(2)}s\` |
| **Mobile Horizontal Overflow** | ${mobLayout.hasHorizontalScroll ? `⚠️ **YES (+${mobLayout.overflowAmount}px)**` : '✅ Clean'} |
| **Console Errors** | \`${technicalData.consoleErrors.length}\` |
| **Failed HTTP Requests (>= 400)** | \`${technicalData.httpErrors.length}\` |
| **Unhandled JS Exceptions** | \`${technicalData.pageExceptions.length}\` |

### 📸 Visual Evidence
- [Desktop Above-The-Fold Screenshot](./screenshots/desktop-fold.png)
- [Desktop FullPage Screenshot](./screenshots/desktop-full.png)
- [Mobile Above-The-Fold Screenshot](./screenshots/mobile-fold.png)
- [Mobile FullPage Screenshot](./screenshots/mobile-full.png)
`;

  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}
