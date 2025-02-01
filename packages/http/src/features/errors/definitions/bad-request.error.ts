import { HttpErrorBase } from "../http-error-base.ts";
import { HTTP_STATUS } from "src/constants/http.ts";

export class BadRequestError extends HttpErrorBase {
  constructor(message = "Bad Request") {
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
  protected override getDefaultMessage(): string {
    return "Bad Request";
  }
}
