import { Logger } from "@tigerstack/core/logs";
import { Inject } from "@tigerstack/core/di";

@Inject()
export class RuntimeLogger {
  private readonly _logger: Logger;

  constructor() {
    this._logger = new Logger({
      timestamp: "timeOnly",
    });
  }

  debug(message: string): void {
    this._logger.debug(message);
  }

  log(message: string): void {
    this._logger.info(message);
  }

  warning(message: string): void {
    this._logger.warning(message);
  }

  error(message: string): void {
    this._logger.error(message);
  }
}
