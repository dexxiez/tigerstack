import { forwardRef, Inject } from "@tigerstack/core/di";
import { HttpErrorHandler } from "../../types/http-error-handler.interface.ts";
import { HttpResponse } from "../../types/http.interfaces.ts";
import { HttpErrorBase } from "./http-error-base.ts";
import { InternalServerError } from "./definitions/internal-server-error.ts";
import { NotImplementedError } from "./definitions/not-implemented-error.ts";
import { Runtime } from "../runtime/runtime.ts";
import { RuntimeLogger } from "../runtime/runtime-logger.ts";
import type { Context } from "koa";

@Inject(forwardRef(() => Runtime), RuntimeLogger)
export class ErrorService implements HttpErrorHandler {
  constructor(private runtime: Runtime, private logger: RuntimeLogger) {}

  async handle(error: unknown, ctx: Context): Promise<HttpResponse> {
    if (error instanceof HttpErrorBase) {
      this.log(error, ctx);
      return error.asHttpResponse();
    }

    if (
      error instanceof Error &&
      error?.message.includes("Method not implemented.")
    ) {
      const notImplementedError = new NotImplementedError();
      this.log(notImplementedError, ctx);
      return notImplementedError.asHttpResponse();
    }

    const internalError = new InternalServerError();
    this.log(internalError, ctx);
    return internalError.asHttpResponse();
  }

  private log(error: HttpErrorBase, ctx: Context): void {
    if (this.runtime.config.logging !== "verbose") return;

    const errRes = error.asHttpResponse();
    if (errRes.status >= 500)
      this.logger.error(`[ERR${errRes.status}] ${error.message}`);
    else this.logger.debug(`[ERR${errRes.status}] ${error.message}`);
  }
}
