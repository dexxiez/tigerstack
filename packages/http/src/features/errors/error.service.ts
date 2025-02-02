import { forwardRef, Inject } from "@tigerstack/core/di";
import { HttpErrorHandler } from "../../types/http-error-handler.interface.ts";
import { HttpResponse } from "../../types/http.interfaces.ts";
import { HttpErrorBase } from "./http-error-base.ts";
import { InternalServerError } from "./definitions/internal-server.error.ts";
import { NotImplementedError } from "./definitions/not-implemented.error.ts";
import { Runtime } from "../runtime/runtime.ts";
import { RuntimeLogger } from "../runtime/runtime-logger.ts";

@Inject(forwardRef(() => Runtime), RuntimeLogger)
export class ErrorService implements HttpErrorHandler {
  constructor(private runtime: Runtime, private logger: RuntimeLogger) {}

  async handle(error: unknown): Promise<HttpResponse> {
    if (
      this.runtime.config.logging === "verbose" &&
      !this.isHttpResponse(error)
    )
      console.error("Error caught:", error);

    if (error instanceof Error && !this.isHttpResponse(error)) {
      if (this.runtime.config.logging === "verbose")
        console.error("Stack trace:", error.stack);
    }

    if (this.isHttpResponse(error)) {
      if (this.runtime.config.logging === "verbose") {
        const err = error as any;
        this.logger.error(`[ERR${err?.status}] ${err?.message}`);
      }
      return error as HttpResponse;
    }

    if (error instanceof HttpErrorBase) {
      this.log(error);
      return error.asHttpResponse();
    }

    if (
      error instanceof Error &&
      error?.message.includes("Method not implemented.")
    ) {
      const notImplementedError = new NotImplementedError();
      this.log(notImplementedError);
      return notImplementedError.asHttpResponse();
    }

    const internalError = new InternalServerError(
      error instanceof Error ? error.message : "Unknown error occurred",
    );
    this.log(internalError);
    return internalError.asHttpResponse();
  }

  private isHttpResponse(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      "headers" in error
    );
  }

  private log(error: HttpErrorBase): void {
    // Always log in debug mode until we fix this
    const errRes = error.asHttpResponse();
    if (errRes.status >= 500) {
      this.logger.error(`[ERR${errRes.status}] ${error.message}`);
    } else {
      this.logger.debug(`[ERR${errRes.status}] ${error.message}`);
    }
  }
}
