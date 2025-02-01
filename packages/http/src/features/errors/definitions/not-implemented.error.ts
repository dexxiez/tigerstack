import { HTTP_STATUS } from "../../../constants/http.ts";
import { HttpHeader } from "../../../types/http.types.ts";
import { HttpErrorBase } from "../http-error-base.ts";

export class NotImplementedError extends HttpErrorBase {
  constructor(
    message?: string,
    additionalHeaders?: Partial<Record<HttpHeader, string>>,
    additionalBody?: Record<string, unknown>,
  ) {
    super(
      HTTP_STATUS.NOT_IMPLEMENTED,
      message,
      additionalHeaders,
      additionalBody,
    );
  }
  protected override getDefaultMessage(): string {
    return "Resource Not Implemented";
  }
}
