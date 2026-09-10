import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private spinner: Ora | null = null;

  startSpinner(text: string): Ora {
    this.spinner = ora({
      text: chalk.cyan(text),
      color: 'cyan',
    }).start();
    return this.spinner;
  }

  updateSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.text = chalk.cyan(text);
    }
  }

  succeedSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.succeed(chalk.greenBright(text));
      this.spinner = null;
    } else {
      console.log(chalk.greenBright(`✔ ${text}`));
    }
  }

  failSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.fail(chalk.redBright(text));
      this.spinner = null;
    } else {
      console.error(chalk.redBright(`✖ ${text}`));
    }
  }

  info(message: string): void {
    console.log(chalk.blue(`ℹ `) + message);
  }

  warn(message: string): void {
    console.log(chalk.yellow(`⚠ `) + chalk.yellow(message));
  }

  error(message: string): void {
    console.error(chalk.red(`✖ `) + chalk.red(message));
  }

  header(title: string): void {
    console.log('\n' + chalk.bold.hex('#4F46E5')(`=== ${title} ===`));
  }

  stat(label: string, value: string | number, highlight: boolean = false): void {
    const valStr = highlight ? chalk.bold.red(value) : chalk.green(value);
    console.log(`  ${chalk.dim('•')} ${chalk.gray(label)}: ${valStr}`);
  }
}

export const logger = new Logger();
