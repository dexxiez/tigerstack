import { HttpHeader } from "../../../types/http.types.ts";
import { HttpErrorBase } from "../http-error-base.ts";
import { HTTP_STATUS } from "../../../constants/http.ts";

export class InternalServerError extends HttpErrorBase {
  constructor(
    message?: string,
    additionalHeaders?: Partial<Record<HttpHeader, string>>,
    additionalBody?: Record<string, unknown>,
  ) {
    super(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message,
      additionalHeaders,
      additionalBody,
    );
  }
  protected override getDefaultMessage(): string {
    return "Server Error Occurred";
  }
}
