import { HttpHeader, HttpMethod } from "./http.types.ts";

export interface HttpRequest {
  method: HttpMethod;
  url: string;
  headers: Partial<Record<HttpHeader, string>>;
  body?: unknown;
}

export interface HttpResponse {
  status: number;
  headers: Partial<Record<HttpHeader, string>>;
  body?: unknown;
}
