<div align="center">

# ⚡ FrontScout

**Autonomous Frontend & UX Audit Agent for High-Converting Cold Outreach**

[![CI](https://github.com/Karman1818/FrontScout/actions/workflows/ci.yml/badge.svg)](https://github.com/Karman1818/FrontScout/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/Tests-10%20Passing-success.svg?style=for-the-badge)](tests/audit.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Headless-2EAD33.svg?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>FrontScout</b> crawls target websites, catches runtime frontend glitches, identifies mobile layout overflows, captures high-res viewport proofs, and preps technical intelligence for Multimodal Vision LLMs to craft personalized outreach pitches.
</p>

<!-- Terminal Demo GIF -->
<p align="center">
  <img src="assets/FrontScout1.gif" alt="FrontScout Terminal Demo" width="820" />
</p>

</div>

---

## 🎯 What is FrontScout?

Cold outreach to web design & dev prospects usually falls flat when using generic templates. **FrontScout** flips the script by turning automated, deep technical auditing into actionable value:

1. **Headless Diagnostics**: Simulates real Desktop (`1920x1080`) and Mobile (`Pixel 7`) environments.
2. **Deep Runtime Observation**: Intercepts unhandled JS errors, console logs, and failed HTTP requests (`>= 400`).
3. **Responsive Defect Spotting**: Pinpoints mobile horizontal scrolling (`scrollWidth > viewportWidth`) and pinpoints the exact offending DOM elements.
4. **Visual Proof Capture**: Grabs both *above-the-fold* (immediate impression) and *full-page* screenshots.
5. **AI Vision Ready**: Emits clean, typed JSON data structured for Multimodal LLMs (Gemini 2.5 Flash / Pro) to formulate code fixes and tailored cold outreach copy.

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
            [ Multimodal Vision LLM ]
            - Inspects captured screenshots
            - Identifies CRO friction & UX flaws
            - Proposes concrete CSS/JS code fixes
            - Formulates tailored cold outreach pitch
                          │
                          ▼
           [ output/<session>/ ]
           ├── screenshots/*.png
           ├── technical-audit.json
           ├── report.json
           └── report.md
```

---

## ✨ Features

- 🖥️ **Dual Viewport Emulation**: Seamless Desktop & Mobile sessions with isolated browser contexts and touch simulation.
- 🚨 **Network & Console Siphon**: Automatically tracks `404s`, missing assets, API failures (`5xx`), and runtime JS errors with stack traces and source locations.
- 📐 **Mobile Horizontal Overflow Engine**: Identifies viewport leaks where elements break container bounds, calculating overflow pixels and CSS selectors.
- 📸 **High-Definition Screenshotting**: Captures both above-the-fold and full-height page renders.
- ⚡ **Zero-Config Developer Experience**: Run instantly with `npx tsx` or build with standard TypeScript.
- 🎨 **Sleek CLI Terminal UI**: Colored terminal output, interactive spinners, and structured metric summaries powered by `chalk` and `ora`.
- 🤖 **Vision LLM Integration**: Multimodal analysis generating executive summaries, code patches, and personalized cold outreach emails.

---

## 📋 Sample Audit Report

Every audit run generates a complete, executive-ready report in both Markdown (`report.md`) and JSON (`report.json`).

👉 **[View the complete sample audit report: `examples/sample-audit-report.md`](examples/sample-audit-report.md)**

### Excerpt from Generated Report:

> #### 🚨 Top Critical Issue #1: Mobile Horizontal Viewport Overflow on Hero Carousel
> - **Category:** `LAYOUT` | **Severity:** `CRITICAL`
> - **Business & CRO Impact:** Mobile users experience awkward horizontal scrolling, resulting in immediate bounce and abandoned browsing sessions.
> - **Technical Proof:** `.promo-slider-container` has an absolute width of `550px` inside a `412px` mobile device viewport (Pixel 7).
> - **Proposed Code Fix:**
> ```css
> .promo-slider-container {
>   width: 100%;
>   max-width: 100vw;
>   overflow-x: hidden;
>   box-sizing: border-box;
> }
> ```
>
> #### ✉️ Ready-to-Send Cold Outreach Pitch:
> **Subject:** *Quick note regarding mobile checkout friction on fashion-boutique-demo.pl*  
> *"Hi Team, while reviewing your store, I noticed that on mobile devices, the main promotional hero banner overflows 142px beyond the screen edge, pushing the primary checkout CTA off-screen and forcing awkward horizontal scrolling. I put together a quick technical audit with viewport screenshots and a clean 3-line CSS fix that resolves it immediately. Would you be open to checking out the full report?"*

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

# Copy and configure environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env (optional, enables Multimodal Vision CRO reports)
```

---

## 💻 Usage

### Run an Audit

Audit any website using the `npm run audit` script:

```bash
# Audit a live website
npm run audit https://example.com

# Audit a local test file
npm run audit tests/test-overflow.html

# Technical-only audit (skipping AI Vision)
npm run audit https://example.com -- --skip-ai
```

Or invoke the CLI directly:

```bash
npx tsx src/audit.ts https://example.com
```

### CLI Options

```text
Usage: frontscout [options] <url>

FrontScout - Autonomous frontend & UX website audit agent

Arguments:
  url                 Target website URL to audit (e.g., example.com or local file)

Options:
  -o, --output <dir>  Path to output directory (default: "output")
  -t, --timeout <ms>  Max page navigation timeout in ms (default: "30000")
  --skip-ai           Skip AI Vision analysis and only perform technical Playwright audit (default: false)
  -h, --help          display help for command
```

### Example Terminal Output

```text
🔍 FrontScout CLI v0.2.0 | Running technical audit for: https://fashion-boutique-demo.pl
✔ Session directory ready: output/fashion-boutique-demo.pl_2026-11-08T19-30-00-000Z
✔ Technical data and screenshots captured successfully!
✔ Vision analysis complete! Generated report.json and report.md

=== FrontScout Technical Audit Summary ===
  • Target URL: https://fashion-boutique-demo.pl
  • Final URL: https://fashion-boutique-demo.pl/
  • Execution time: 3.84s
  • Console errors (console.error): 0
  • Unhandled JS exceptions (pageerror): 0
  • HTTP network errors (>= 400): 0
  • Mobile Horizontal Scroll: YES (overflow: +142px)

  Elements causing horizontal overflow on mobile:
    - div.promo-slider-container (scrollWidth: 554px, viewport: 412px)

Captured screenshots:
  • Desktop Viewport:   output/.../screenshots/desktop-fold.png
  • Desktop FullPage:   output/.../screenshots/desktop-full.png
  • Mobile Viewport:    output/.../screenshots/mobile-fold.png
  • Mobile FullPage:    output/.../screenshots/mobile-full.png

=== AI Vision UX & Conversion Analysis (gemini-2.5-flash) ===
The site suffers from critical mobile viewport overflow (+142px) caused by an unconstrained promotional hero slider...

🚨 Top Critical Issues:
  #1 Mobile Horizontal Viewport Overflow on Hero Carousel [LAYOUT | CRITICAL]
     Impact: Mobile users experience awkward horizontal scrolling, resulting in bounce.
     Fix snippet: .promo-slider-container { width: 100%; max-width: 100vw; ... }

✉️  Outreach Email Icebreaker:
  Subject: Quick note regarding mobile checkout friction on fashion-boutique-demo.pl
  Body:    "While reviewing your store, I noticed that on mobile devices..."

✔ Comprehensive report generated: output/.../report.md
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
    ├── technical-audit.json      # Structured telemetry (logs, DOM leaks, HTTP)
    ├── report.json               # Typed JSON audit report from Multimodal LLM
    └── report.md                 # Executive Markdown report ready for client presentation
```

---

## 🧪 Automated Testing Suite (10 Tests)

FrontScout includes a robust automated test suite built on Node's native `node:test` runner. The suite executes in **< 100ms** with zero external network or browser dependencies, ensuring lightning-fast CI runs.

```bash
# Run the test suite
npm test
```

### Test Coverage Highlights:
1. `normalizeUrl`: Prepending protocol and resolving relative file paths to `file://` URLs.
2. `sanitizeHostname`: Extracting clean domain identifiers and subdomains across URL variants.
3. `sanitizeHostname`: Handling `file://` protocols and fallbacks on malformed URLs.
4. `saveJsonFile` & `prepareAuditDirectory`: Ephemeral directory generation and JSON serialization.
5. `buildVisionPrompt`: Formatting telemetry, culprit elements, and HTTP/Console errors into the Vision prompt.
6. `buildVisionPrompt`: Clean baseline handling when zero defects are detected.
7. `generateMarkdownReport`: Markdown generation with executive summaries, code fixes, and outreach pitches.
8. `generateMarkdownReport`: Graceful handling of empty issues lists.
9. `generateJsonReport`: Type-safe serialization of `FinalAuditReport`.
10. `layout telemetry aggregator`: Validating layout overflow computations and element culprit structures.

---

## ⚙️ CI/CD (GitHub Actions)

Continuous Integration is configured via [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Every push and pull request executes:
- Multi-version Node.js matrix testing (`Node 20.x` & `Node 22.x` on `ubuntu-latest`).
- Clean package dependency installation (`npm ci`).
- Automated test suite execution (`npm test`).
- Full TypeScript typecheck and build validation (`npm run build`).

---

## 🛠️ How I Built It (AI Pair Programming & Architecture)

> *Recruiter & Technical Deep-Dive: A 100% transparent breakdown of building this project end-to-end via AI pair programming with Google Gemini, highlighting architectural steering, iterative feedback loops, and quality verification.*

### 🤖 1. The Tooling: Pair Programming with Gemini
* **Google Gemini (Gemini 3.8 / High)**: The entire project was developed in close pair programming collaboration with Google Gemini. Rather than hand-typing boilerplate, my role was that of an **AI System Architect & Technical Director** — defining the problem domain, structuring the pipeline, and iteratively guiding the model through prompt design, code generation, and debugging sessions.
* **Google Gemini Multimodal Vision API (`@google/genai` - `gemini-2.5-flash`)**: Integrated directly into the runtime CLI application to visually evaluate headless screenshots alongside technical telemetry, turning raw logs into CRO conversion audits and targeted cold outreach copy.

### 🧭 2. My Role: Architectural Steering & Feedback Loops
Effective AI-driven development isn't about blind copy-pasting; it requires deep domain understanding, active architectural steering, and rigorous verification:

1. **Defining the Technical Domain & Edge Cases**:
   * Directed Gemini to move beyond naive checks (`scrollWidth > innerWidth`), guiding it to evaluate actual rendered DOM geometry (`getBoundingClientRect`), computed styles (`overflow`, `position`, `display`), and compute the exact CSS selectors causing mobile horizontal scroll distortion.
2. **Context Isolation & Dual-Device Emulation**:
   * Instructed the model to architect separate, ephemeral browser contexts for Desktop (`1920x1080`) and Mobile (`Pixel 7`), preventing cookie/cache bleed and ensuring authentic touch and DPR emulation.
3. **Prompt Engineering & Anti-Hallucination Guardrails**:
   * Constrained the Vision LLM with strict JSON schemas (`responseMimeType: 'application/json'`), anchoring the analysis in verified Playwright telemetry so every detected issue contains business impact, technical proof, and runnable CSS/JS code fixes.
4. **Resilience & Graceful Degradation**:
   * Steered the CLI architecture to fail-safe defaults — third-party script crashes or missing API keys never crash the pipeline; technical audits are always captured and saved.
5. **Automated Verification & CI**:
   * Directed the creation of a zero-external-dependency automated test suite (10 hermetic tests in Node's native `node:test` runner) and GitHub Actions CI matrix to continuously verify build and runtime health on every push.

### 💡 3. The Takeaway: AI-Native Engineering
This project reflects modern software development: leveraging state-of-the-art AI pair programming for velocity, while taking full ownership of system architecture, prompt precision, and automated testing to deliver a production-ready developer tool.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
