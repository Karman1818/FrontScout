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
  logger.header('Podsumowanie audytu technicznego FrontScout');
  
  logger.stat('Badany adres URL', result.url);
  logger.stat('Docelowy adres URL', result.finalUrl);
  logger.stat('Czas wykonania', `${(result.durationMs / 1000).toFixed(2)}s`);
  logger.stat('Błędy konsoli (console.error)', result.consoleErrors.length, result.consoleErrors.length > 0);
  logger.stat('Nieobsłużone wyjątki JS (pageerror)', result.pageExceptions.length, result.pageExceptions.length > 0);
  logger.stat('Błędy sieciowe HTTP (>= 400)', result.httpErrors.length, result.httpErrors.length > 0);

  const mobLayout = result.viewports.mobile.layout;
  logger.stat(
    'Mobile Horizontal Scroll',
    mobLayout.hasHorizontalScroll
      ? `TAK (przelew: +${mobLayout.overflowAmount}px)`
      : 'NIE (layout poprawny)',
    mobLayout.hasHorizontalScroll
  );

  if (mobLayout.hasHorizontalScroll && mobLayout.culpritElements?.length) {
    console.log(chalk.yellow('\n  Elementy powodujące rozpychanie ekranu na mobile:'));
    for (const el of mobLayout.culpritElements.slice(0, 5)) {
      console.log(
        chalk.gray(`    - `) +
        chalk.cyan(el.selector) +
        chalk.dim(` (scrollWidth: ${el.scrollWidth}px, viewport: ${el.viewportWidth}px)`)
      );
    }
  }

  if (result.httpErrors.length > 0) {
    console.log(chalk.red('\n  Zarejestrowane błędy sieciowe:'));
    for (const err of result.httpErrors.slice(0, 5)) {
      console.log(
        chalk.gray(`    - `) +
        chalk.bold.red(`[${err.status} ${err.statusText}] `) +
        chalk.dim(err.url)
      );
    }
  }

  if (result.consoleErrors.length > 0) {
    console.log(chalk.red('\n  Zarejestrowane błędy konsoli:'));
    for (const err of result.consoleErrors.slice(0, 5)) {
      console.log(
        chalk.gray(`    - `) +
        chalk.yellow(`[${err.type.toUpperCase()}] `) +
        err.text
      );
    }
  }

  console.log('\n' + chalk.bold('Wygenerowane zrzuty ekranu:'));
  console.log(chalk.dim(`  • Desktop Viewport:   ${result.viewports.desktop.screenshotFoldPath}`));
  console.log(chalk.dim(`  • Desktop FullPage:   ${result.viewports.desktop.screenshotFullPath}`));
  console.log(chalk.dim(`  • Mobile Viewport:    ${result.viewports.mobile.screenshotFoldPath}`));
  console.log(chalk.dim(`  • Mobile FullPage:    ${result.viewports.mobile.screenshotFullPath}`));

  console.log('\n' + chalk.greenBright(`✔ Zapisano surowe dane audytu w: `) + chalk.underline(`${result.outputDirectory}/technical-audit.json`));
}

async function main() {
  const program = new Command();

  program
    .name('frontscout')
    .description('FrontScout - autonomiczny agent audytujący frontend i UX stron WWW')
    .argument('<url>', 'Adres URL strony do audytu (np. example.com lub https://example.com)')
    .option('-o, --output <dir>', 'Ścieżka do katalogu wyjściowego', 'output')
    .option('-t, --timeout <ms>', 'Maksymalny czas oczekiwania na załadowanie strony w ms', '30000')
    .action(async (rawUrl: string, opts) => {
      const normalizedUrl = normalizeUrl(rawUrl);

      // Validate URL format
      try {
        new URL(normalizedUrl);
      } catch {
        logger.error(`Podano nieprawidłowy format adresu URL: "${rawUrl}"`);
        process.exit(1);
      }

      const timeoutMs = parseInt(opts.timeout, 10) || 30000;
      const collector = new PlaywrightCollector();

      try {
        console.log(
          chalk.bold.hex('#6366F1')(`\n🔍 FrontScout CLI `) +
          chalk.dim(`v0.1.0 | Uruchamianie audytu technicznego dla: `) +
          chalk.cyanBright(normalizedUrl)
        );

        logger.startSpinner('Przygotowuję środowisko i katalog wyjściowy...');
        const paths = await prepareAuditDirectory(normalizedUrl, opts.output);
        logger.succeedSpinner(`Katalog sesji gotowy: ${paths.rootDir}`);

        logger.startSpinner('Inicjalizuję Playwright i uruchamiam sesje audytowe...');
        const result = await collector.runAudit(normalizedUrl, paths, { timeoutMs });
        logger.succeedSpinner('Pomyślnie zebrano dane techniczne i zrzuty ekranu!');

        printSummary(result);
      } catch (err: any) {
        logger.failSpinner('Wystąpił błąd podczas wykonywania audytu.');
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
  logger.error(`Krytyczny błąd: ${err.message}`);
  process.exit(1);
});
