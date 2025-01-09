import chalk from "chalk";
import { LoggingOptions } from "./logs.interfaces.ts";
import { LogSeverityLevel } from "./logs.types.ts";

export class Logger {
  private readonly showSeverity: LoggingOptions["showSeverity"];
  private readonly timestamp: LoggingOptions["timestamp"];

  constructor(options: LoggingOptions = {}) {
    this.showSeverity = options.showSeverity ?? false;
    this.timestamp = options.timestamp ?? false;
  }

  private log(severity: LogSeverityLevel, message: string): void {
    const color = this.getSeverityColor(severity);
    const parts = [
      this.timestamp && `[${this.getTimestamp()}]`,
      this.showSeverity && `[${severity.toUpperCase()}]`,
      color(message),
    ].filter(Boolean);

    console.log(parts.join(" "));
  }

  public debug = (message: string): void => this.log("debug", message);
  public info = (message: string): void => this.log("info", message);
  public warning = (message: string): void => this.log("warn", message);
  public error = (message: string): void => this.log("error", message);

  private getSeverityColor(severity: LogSeverityLevel): chalk.Chalk {
    const colors: Record<LogSeverityLevel, chalk.Chalk> = {
      debug: chalk.blueBright,
      info: chalk.greenBright,
      warn: chalk.yellowBright,
      error: chalk.redBright,
    };
    return colors[severity] ?? chalk.white;
  }

  private getTimestamp(): string {
    if (this.timestamp === "local") {
      return new Date().toLocaleString().toUpperCase();
    }
    if (this.timestamp === "timeOnly") {
      return new Date().toLocaleTimeString().toUpperCase();
    }
    return new Date().toISOString();
  }
}
