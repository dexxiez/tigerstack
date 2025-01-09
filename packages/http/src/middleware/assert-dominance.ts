import { Middleware } from "../features/middleware/middleware.ts";
import { HTTP_STATUS } from "../constants/http.ts";
import { HttpRequest, HttpResponse } from "../interfaces/http.ts";

export class AssertDominanceMiddleware implements Middleware {
  name = "AssertDominanceMiddleware";
  async request(req: HttpRequest): Promise<HttpRequest> {
    return req;
  }

  async response(res: HttpResponse): Promise<HttpResponse> {
    res.headers["Server"] = "TigerStack";
    res.status = HTTP_STATUS.MR_IS_TEAPOT;
    return res;
  }
}
