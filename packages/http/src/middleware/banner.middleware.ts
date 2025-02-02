import { Middleware } from "../features/pipeline/middleware.ts";
import { HttpRequest, HttpResponse } from "../types/http.interfaces.ts";

export class BannerMiddleware implements Middleware {
  name = "BannerMiddleware";
  async request(req: HttpRequest, res: HttpResponse) {
    return { req, res };
  }

  async response(res: HttpResponse): Promise<HttpResponse> {
    res.headers["server"] = "tigerstack";
    return res;
  }
}
