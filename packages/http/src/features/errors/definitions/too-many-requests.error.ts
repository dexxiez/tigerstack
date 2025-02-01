import { HttpErrorBase } from "../http-error-base.ts";
import { HTTP_STATUS } from "src/constants/http.ts";

export class TooManyRequestsError extends HttpErrorBase {
  constructor(message = "Too Many Requests") {
    super(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }
  protected override getDefaultMessage(): string {
    return "Too Many Requests";
  }
}
