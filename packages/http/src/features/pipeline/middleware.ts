import { HttpResponse, HttpRequest } from "../../types/http.interfaces.ts";

export interface Middleware {
  name: string;
  request(req: HttpRequest): Promise<HttpRequest>;
  response(res: HttpResponse): Promise<HttpResponse>;
}

export interface MiddlewareFactory {
  create(): Promise<Middleware>;
}
