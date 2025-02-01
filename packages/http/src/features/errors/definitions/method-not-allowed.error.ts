import { HttpErrorBase } from "../http-error-base.ts";
import { HTTP_STATUS } from "src/constants/http.ts";

export class MethodNotAllowedError extends HttpErrorBase {
  constructor(message = "Method Not Allowed") {
    super(HTTP_STATUS.METHOD_NOT_ALLOWED, message);
  }
  protected override getDefaultMessage(): string {
    return "Method Not Allowed";
  }
}
