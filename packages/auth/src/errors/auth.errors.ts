import { HTTP_STATUS, HttpErrorBase } from "@tigerstack/http";

export class UnauthorizedError extends HttpErrorBase {
  constructor(message = "Unauthorized") {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }

  protected getDefaultMessage(): string {
    return "Unauthorized";
  }
}

export class ForbiddenError extends HttpErrorBase {
  constructor(message = "Forbidden") {
    super(HTTP_STATUS.FORBIDDEN, message);
  }

  protected getDefaultMessage(): string {
    return "Forbidden";
  }
}
