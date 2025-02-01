import { HttpErrorBase } from "../http-error-base.ts";
import { HTTP_STATUS } from "src/constants/http.ts";

export class NotAcceptableError extends HttpErrorBase {
  constructor(message = "Not Acceptable") {
    super(HTTP_STATUS.NOT_ACCEPTABLE, message);
  }
  protected override getDefaultMessage(): string {
    return "Not Acceptable";
  }
}
