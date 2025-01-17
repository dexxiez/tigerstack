import { HttpHeader } from "src/types/http.types.ts";
import { HttpErrorBase } from "../http-error-base.ts";
import { HTTP_STATUS } from "src/constants/http.ts";

export class NotFoundError extends HttpErrorBase {
  constructor(
    message?: string,
    additionalHeaders?: Partial<Record<HttpHeader, string>>,
    additionalBody?: Record<string, unknown>,
  ) {
    super(HTTP_STATUS.NOT_FOUND, message, additionalHeaders, additionalBody);
  }
  protected override getDefaultMessage(): string {
    return "Resource Not Found";
  }
}
