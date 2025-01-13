import { Middleware } from "../features/pipeline/middleware.ts";
import { HttpRequest, HttpResponse } from "../types/http.interfaces.ts";

export class AssertDominanceMiddleware implements Middleware {
  name = "AssertDominanceMiddleware";
  async request(req: HttpRequest): Promise<HttpRequest> {
    return req;
  }

  async response(res: HttpResponse): Promise<HttpResponse> {
    res.headers["Server"] = "TigerStack";
    return res;
  }
}
