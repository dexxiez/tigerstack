import { HttpResponse, HttpRequest } from "../../types/http.interfaces.ts";

export interface Middleware {
  name: string;
  request(
    req: HttpRequest,
    res: HttpResponse,
  ): Promise<{ req: HttpRequest; res: HttpResponse }>;
  response(res: HttpResponse): Promise<HttpResponse>;
}

export interface MiddlewareFactory {
  create(): Promise<Middleware>;
}
