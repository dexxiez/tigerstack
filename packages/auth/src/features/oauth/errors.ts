import { HttpErrorBase, HTTP_STATUS } from "@tigerstack/http";
export class OAuthError extends HttpErrorBase {
  constructor(
    message?: string,
    additionalHeaders?: Partial<Record<string, string>>,
    additionalBody?: Record<string, unknown>,
  ) {
    super(
      HTTP_STATUS.BAD_REQUEST,
      message || "OAuth Error",
      additionalHeaders,
      additionalBody,
    );
  }

  protected override getDefaultMessage(): string {
    return "OAuth Error";
  }
}

export class InvalidStateError extends OAuthError {
  constructor() {
    super("Invalid CSRF state token");
  }

  protected override getDefaultMessage(): string {
    return "Invalid CSRF state token";
  }
}

export class ProviderNotFoundError extends OAuthError {
  constructor(providerName: string) {
    super(`OAuth provider '${providerName}' not found`);
  }

  protected override getDefaultMessage(): string {
    return "OAuth provider not found";
  }
}

export class TokenExchangeError extends OAuthError {
  constructor(provider: string, details?: string) {
    super(
      `Failed to exchange code for tokens with provider ${provider}${
        details ? `: ${details}` : ""
      }`,
    );
  }

  protected override getDefaultMessage(): string {
    return "Token exchange failed";
  }
}
