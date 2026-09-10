<div align="center">

# ⚡ FrontScout

**Autonomous Frontend & UX Audit Agent for High-Converting Cold Outreach**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Headless-2EAD33.svg?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>FrontScout</b> crawls target websites, catches runtime frontend glitches, identifies mobile layout overflows, captures high-res viewport proofs, and preps technical intelligence for Multimodal Vision LLMs to craft personalized outreach pitches.
</p>

</div>

---

## 🎯 What is FrontScout?

Cold outreach to web design & dev prospects usually falls flat when using generic templates. **FrontScout** flips the script by turning automated, deep technical auditing into actionable value:

1. **Headless Diagnostics**: Simulates real Desktop (`1920x1080`) and Mobile (`Pixel 7`) environments.
2. **Deep Runtime Observation**: Intercepts unhandled JS errors, console logs, and failed HTTP requests (`>= 400`).
3. **Responsive Defect Spotting**: Pinpoints mobile horizontal scrolling (`scrollWidth > viewportWidth`) and pinpoints the exact offending DOM elements.
4. **Visual Proof Capture**: Grabs both *above-the-fold* (immediate impression) and *full-page* screenshots.
5. **AI Vision Ready**: Emits clean, typed JSON data structured for Multimodal LLMs (GPT-4o, Claude 3.5 Sonnet) to formulate code fixes and tailored cold outreach copy.

---

## 🏗️ Architecture & Workflow

```text
               ┌───────────────────────┐
               │    Target Website     │
               └──────────┬────────────┘
                          │
            [ Playwright Headless Engine ]
                          │
        ┌─────────────────┴─────────────────┐
        ▼                                   ▼
 [ Desktop Context ]                 [ Mobile Context ]
  - 1920x1080 Viewport                - Pixel 7 Emulation
  - Fold & Full Screenshot            - Fold & Full Screenshot
  - Console & HTTP Siphon             - Horizontal Scroll Detector
        │                                   │
        └─────────────────┬─────────────────┘
                          │
                          ▼
            [ Diagnostic Aggregator ]
            - Filters network failures (>= 400)
            - Traces DOM overflow culprits
            - Records uncaught page exceptions
                          │
                          ▼
           [ output/<session>/ ]
           ├── screenshots/*.png
           ├── technical-audit.json
           └── (Next: report.json & report.md via Vision LLM)
```

---

## ✨ Features

- 🖥️ **Dual Viewport Emulation**: Seamless Desktop & Mobile sessions with isolated browser contexts and touch simulation.
- 🚨 **Network & Console Siphon**: Automatically tracks `404s`, missing assets, API failures (`5xx`), and runtime JS errors with stack traces and source locations.
- 📐 **Mobile Horizontal Overflow Engine**: Identifies viewport leaks where elements break container bounds, calculating overflow pixels and CSS selectors.
- 📸 **High-Definition Screenshotting**: Captures both above-the-fold and full-height page renders.
- ⚡ **Zero-Config Developer Experience**: Run instantly with `npx tsx` or build with standard TypeScript.
- 🎨 **Sleek CLI Terminal UI**: Colored terminal output, interactive spinners, and structured metric summaries powered by `chalk` and `ora`.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/Karman1818/FrontScout.git
cd FrontScout

# Install project dependencies
npm install

# Install Playwright browser binaries (Chromium)
npx playwright install chromium
```

---

## 💻 Usage

### Run an Audit

Audit any website using the `npm run audit` script:

```bash
npm run audit https://example.com
```

Or invoke the CLI directly:

```bash
npx tsx src/audit.ts https://example.com
```

### CLI Options

```text
Usage: frontscout [options] <url>

FrontScout - Autonomous website frontend & visual audit CLI tool

Arguments:
  url                 Target URL to audit (e.g., example.com or https://example.com)

Options:
  -o, --output <dir>  Path to output directory (default: "output")
  -t, --timeout <ms>  Max page navigation timeout in milliseconds (default: "30000")
  -h, --help          Display help for command
```

### Example Terminal Output

```text
🔍 FrontScout CLI v0.1.0 | Uruchamianie audytu technicznego dla: https://example.com
✔ Katalog sesji gotowy: output/example.com_2026-09-10T09-15-02-189Z
✔ Pomyślnie zebrano dane techniczne i zrzuty ekranu!

=== Podsumowanie audytu technicznego FrontScout ===
  • Badany adres URL: https://example.com
  • Docelowy adres URL: https://example.com/
  • Czas wykonania: 5.29s
  • Błędy konsoli (console.error): 0
  • Nieobsłużone wyjątki JS (pageerror): 0
  • Błędy sieciowe HTTP (>= 400): 0
  • Mobile Horizontal Scroll: NIE (layout poprawny)

Wygenerowane zrzuty ekranu:
  • Desktop Viewport:   output/example.com_.../screenshots/desktop-fold.png
  • Desktop FullPage:   output/example.com_.../screenshots/desktop-full.png
  • Mobile Viewport:    output/example.com_.../screenshots/mobile-fold.png
  • Mobile FullPage:    output/example.com_.../screenshots/mobile-full.png

✔ Zapisano surowe dane audytu w: output/example.com_.../technical-audit.json
```

---

## 📂 Output Structure

Audits are stored in timestamped session folders:

```text
output/
└── <domain_timestamp>/
    ├── screenshots/
    │   ├── desktop-fold.png      # Desktop above-the-fold viewport (1920x1080)
    │   ├── desktop-full.png      # Desktop full-page document capture
    │   ├── mobile-fold.png       # Mobile above-the-fold viewport (Pixel 7)
    │   └── mobile-full.png       # Mobile full-page document capture
    └── technical-audit.json      # Structured audit report with logs & metadata
```

### Sample `technical-audit.json`

```json
{
  "url": "https://example.com",
  "finalUrl": "https://example.com/",
  "timestamp": "2026-09-10T09:15:07.488Z",
  "durationMs": 5289,
  "consoleErrors": [],
  "pageExceptions": [],
  "httpErrors": [],
  "viewports": {
    "desktop": {
      "viewport": "desktop",
      "viewportSize": { "width": 1920, "height": 1080 },
      "screenshotFoldPath": "...",
      "screenshotFullPath": "...",
      "layout": { "hasHorizontalScroll": false, "overflowAmount": 0 }
    },
    "mobile": {
      "viewport": "mobile",
      "deviceName": "Pixel 7",
      "viewportSize": { "width": 412, "height": 839 },
      "screenshotFoldPath": "...",
      "screenshotFullPath": "...",
      "layout": { "hasHorizontalScroll": false, "overflowAmount": 0 }
    }
  }
}
```

---

## 🗺️ Roadmap

- [x] **Phase 1**: Headless Playwright data collection (HTTP errors, console logs, layout overflow, screenshots).
- [ ] **Phase 2**: Multimodal Vision LLM integration (GPT-4o & Claude 3.5 Sonnet analysis of visual defects, contrast, CTA placement).
- [ ] **Phase 3**: Automated Markdown & JSON report generation featuring Top 3 critical bugs with CSS/JS fix snippets.
- [ ] **Phase 4**: Cold outreach email generator drafting bespoke 2-3 sentence icebreakers for agency leads.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
