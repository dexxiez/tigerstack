import { HttpRequest, HttpResponse } from "../types/http.interfaces.ts";
import { Middleware } from "../features/pipeline/middleware.ts";

export class RouterMiddleware implements Middleware {
  name = "RouterMiddleware";
  request(req: HttpRequest): Promise<HttpRequest> {
    throw new Error("Method not implemented.");
  }
  response(res: HttpResponse): Promise<HttpResponse> {
    throw new Error("Method not implemented.");
  }
}
