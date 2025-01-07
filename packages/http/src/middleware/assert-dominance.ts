import { HTTP_STATUS } from "../constants/http.ts";
import { HttpRequest, HttpResponse } from "../interfaces/http.ts";
import { MiddlewareButNotInAGayWay } from "../interfaces/middleware.ts";

export class AssertDominanceMiddleware implements MiddlewareButNotInAGayWay {
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
