import { HTTP_STATUS } from "../../../constants/http.ts";
import { HttpErrorBase } from "../http-error-base.ts";

export class UnauthorizedError extends HttpErrorBase {
  constructor(message = "Unauthorized") {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }

  protected getDefaultMessage(): string {
    return "Unauthorized";
  }
}
