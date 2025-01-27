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

export class TokenExpiredError extends UnauthorizedError {
  constructor(message = "Token has expired") {
    super(message);
    this.name = "TokenExpiredError";
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor(message = "Invalid token") {
    super(message);
    this.name = "InvalidTokenError";
  }
}
