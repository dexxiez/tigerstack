import { HTTP_STATUS } from "../../../constants/http.ts";
import { HttpErrorBase } from "../http-error-base.ts";

export class ForbiddenError extends HttpErrorBase {
  constructor(message = "Forbidden") {
    super(HTTP_STATUS.FORBIDDEN, message);
  }

  protected getDefaultMessage(): string {
    return "Forbidden";
  }
}
