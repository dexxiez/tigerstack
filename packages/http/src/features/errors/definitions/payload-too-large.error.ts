import { HttpErrorBase } from "../http-error-base.ts";
import { HTTP_STATUS } from "src/constants/http.ts";

export class PayloadTooLargeError extends HttpErrorBase {
  constructor(message = "Payload Too Large") {
    super(HTTP_STATUS.PAYLOAD_TOO_LARGE, message);
  }
  protected override getDefaultMessage(): string {
    return "Payload Too Large";
  }
}
