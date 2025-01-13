import { HttpHeader } from "../../types/http.types.ts";
import { HTTP_STATUS } from "../../constants/http.ts";
import { commonErrorHeaders } from "./common-error-headers.ts";
import { HttpResponse } from "../../types/http.interfaces.ts";

export type HttpErrorStatus = keyof typeof HTTP_STATUS | number;

export abstract class HttpErrorBase extends Error {
  public readonly status: HttpErrorStatus;
  public readonly headers: Partial<Record<HttpHeader, string>>;
  public readonly body: Record<string, unknown>;

  protected constructor(
    status: HttpErrorStatus,
    message?: string,
    additionalHeaders: Partial<Record<HttpHeader, string>> = {},
    additionalBody: Record<string, unknown> = {},
  ) {
    super(message || `Error ${status}`);

    this.status = status;
    this.headers = {
      ...commonErrorHeaders,
      ...additionalHeaders,
    };
    this.body = {
      message: message || this.getDefaultMessage(),
      ...additionalBody,
    };
  }

  protected abstract getDefaultMessage(): string;

  public asHttpResponse(): HttpResponse {
    return {
      status:
        typeof this.status === "string"
          ? HTTP_STATUS[this.status] || 500
          : this.status,
      headers: {
        ...this.headers,
      },
      body: {
        ...this.body,
      },
    };
  }
}
