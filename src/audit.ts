#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { PlaywrightCollector } from './collectors/playwright.js';
import { prepareAuditDirectory } from './utils/fileSystem.js';
import { logger } from './utils/logger.js';
import { TechnicalAuditResult } from './types/audit.js';

function normalizeUrl(rawUrl: string): string {
  let trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed) && !/^file:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

function printSummary(result: TechnicalAuditResult): void {
  logger.header('FrontScout Technical Audit Summary');
  
  logger.stat('Target URL', result.url);
  logger.stat('Final URL', result.finalUrl);
  logger.stat('Execution time', `${(result.durationMs / 1000).toFixed(2)}s`);
  logger.stat('Console errors (console.error)', result.consoleErrors.length, result.consoleErrors.length > 0);
  logger.stat('Unhandled JS exceptions (pageerror)', result.pageExceptions.length, result.pageExceptions.length > 0);
  logger.stat('HTTP network errors (>= 400)', result.httpErrors.length, result.httpErrors.length > 0);

  const mobLayout = result.viewports.mobile.layout;
  logger.stat(
    'Mobile Horizontal Scroll',
    mobLayout.hasHorizontalScroll
      ? `YES (overflow: +${mobLayout.overflowAmount}px)`
      : 'NO (clean layout)',
    mobLayout.hasHorizontalScroll
  );

  if (mobLayout.hasHorizontalScroll && mobLayout.culpritElements?.length) {
    console.log(chalk.yellow('\n  Elements causing horizontal overflow on mobile:'));
    for (const el of mobLayout.culpritElements.slice(0, 5)) {
      console.log(
        chalk.gray(`    - `) +
        chalk.cyan(el.selector) +
        chalk.dim(` (scrollWidth: ${el.scrollWidth}px, viewport: ${el.viewportWidth}px)`)
      );
    }
  }

  if (result.httpErrors.length > 0) {
    console.log(chalk.red('\n  Recorded HTTP network errors:'));
    for (const err of result.httpErrors.slice(0, 5)) {
      console.log(
        chalk.gray(`    - `) +
        chalk.bold.red(`[${err.status} ${err.statusText}] `) +
        chalk.dim(err.url)
      );
    }
  }

  if (result.consoleErrors.length > 0) {
    console.log(chalk.red('\n  Recorded console errors:'));
    for (const err of result.consoleErrors.slice(0, 5)) {
      console.log(
        chalk.gray(`    - `) +
        chalk.yellow(`[${err.type.toUpperCase()}] `) +
        err.text
      );
    }
  }

  console.log('\n' + chalk.bold('Captured screenshots:'));
  console.log(chalk.dim(`  • Desktop Viewport:   ${result.viewports.desktop.screenshotFoldPath}`));
  console.log(chalk.dim(`  • Desktop FullPage:   ${result.viewports.desktop.screenshotFullPath}`));
  console.log(chalk.dim(`  • Mobile Viewport:    ${result.viewports.mobile.screenshotFoldPath}`));
  console.log(chalk.dim(`  • Mobile FullPage:    ${result.viewports.mobile.screenshotFullPath}`));

  console.log('\n' + chalk.greenBright(`✔ Saved raw audit data to: `) + chalk.underline(`${result.outputDirectory}/technical-audit.json`));
}

async function main() {
  const program = new Command();

  program
    .name('frontscout')
    .description('FrontScout - Autonomous frontend & UX website audit agent')
    .argument('<url>', 'Target website URL to audit (e.g., example.com or https://example.com)')
    .option('-o, --output <dir>', 'Path to output directory', 'output')
    .option('-t, --timeout <ms>', 'Max page navigation timeout in ms', '30000')
    .action(async (rawUrl: string, opts) => {
      const normalizedUrl = normalizeUrl(rawUrl);

      // Validate URL format
      try {
        new URL(normalizedUrl);
      } catch {
        logger.error(`Invalid URL format: "${rawUrl}"`);
        process.exit(1);
      }

      const timeoutMs = parseInt(opts.timeout, 10) || 30000;
      const collector = new PlaywrightCollector();

      try {
        console.log(
          chalk.bold.hex('#6366F1')(`\n🔍 FrontScout CLI `) +
          chalk.dim(`v0.1.0 | Running technical audit for: `) +
          chalk.cyanBright(normalizedUrl)
        );

        logger.startSpinner('Preparing environment and session directory...');
        const paths = await prepareAuditDirectory(normalizedUrl, opts.output);
        logger.succeedSpinner(`Session directory ready: ${paths.rootDir}`);

        logger.startSpinner('Initializing Playwright and running audit sessions...');
        const result = await collector.runAudit(normalizedUrl, paths, { timeoutMs });
        logger.succeedSpinner('Technical data and screenshots captured successfully!');

        printSummary(result);
      } catch (err: any) {
        logger.failSpinner('An error occurred while running the audit.');
        logger.error(err.message || String(err));
        if (process.env.DEBUG) {
          console.error(err);
        }
        process.exit(1);
      } finally {
        await collector.close();
      }
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
