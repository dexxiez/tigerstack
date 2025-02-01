import { HttpErrorBase } from "../http-error-base.ts";
import { HTTP_STATUS } from "src/constants/http.ts";

export class ImATeapotError extends HttpErrorBase {
  constructor(message = "I'm a Teapot") {
    super(HTTP_STATUS.IM_A_TEAPOT, message);
  }
  protected override getDefaultMessage(): string {
    return "I'm a Teapot";
  }
}

export { ImATeapotError as Teapot }; // Allows to throw a teapot straight up lmao
