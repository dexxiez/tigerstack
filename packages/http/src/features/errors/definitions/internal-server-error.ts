import { HttpHeader } from "src/types/http.types.ts";
import { HttpErrorBase } from "../http-error-base.ts";
import { HttpResponse } from "src/types/http.interfaces.ts";

export class InternalServerError extends HttpErrorBase {
  constructor(
    message?: string,
    additionalHeaders?: Partial<Record<HttpHeader, string>>,
    additionalBody?: Record<string, unknown>,
  ) {
    super("INTERNAL_SERVER_ERROR", message, additionalHeaders, additionalBody);
  }
  protected override getDefaultMessage(): string {
    return "Server Error Occurred";
  }
}
