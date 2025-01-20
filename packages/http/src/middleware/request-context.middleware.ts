import { RequestContext } from "../features/pipeline/request-context.ts";
import { HTTP_STATUS } from "../constants/http.ts";
import { Middleware } from "../features/pipeline/middleware.ts";
import { HttpRequest, HttpResponse } from "../types/http.interfaces.ts";

export class RequestContextMiddleware implements Middleware {
  name = "RequestContextMiddleware";

  async request(req: HttpRequest): Promise<HttpRequest> {
    // Create initial response object
    const res: HttpResponse = {
      status: HTTP_STATUS.OK,
      headers: {},
      body: undefined,
    };

    RequestContext.setContext(req, res);
    return req;
  }

  async response(res: HttpResponse): Promise<HttpResponse> {
    // Clean up the context after we're done
    RequestContext.clear();
    return res;
  }
}
