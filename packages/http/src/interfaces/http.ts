import { HttpHeader, HttpMethod } from "../types/http.types.ts";

export interface HttpRequest {
  method: HttpMethod;
  url: string;
  headers: Record<HttpHeader, string>;
  body?: unknown;
}

export interface HttpResponse {
  status: number;
  headers: Record<HttpHeader, string>;
  body?: unknown;
}
