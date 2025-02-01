import { HttpErrorBase } from "../http-error-base.ts";
import { HTTP_STATUS } from "src/constants/http.ts";

export class PaymentRequiredError extends HttpErrorBase {
  constructor(message = "Payment Required") {
    super(HTTP_STATUS.PAYMENT_REQUIRED, message);
  }
  protected override getDefaultMessage(): string {
    return "Payment Required";
  }
}
