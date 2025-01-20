import { HttpRequest, HttpResponse } from "../types/http.interfaces.ts";
import { Middleware } from "../features/pipeline/middleware.ts";
import { RouterService } from "../features/routing/router.service.ts";
import { Inject } from "@tigerstack/core/di";
import { RequestContext } from "../features/pipeline/request-context.ts";

@Inject(RouterService)
export class RouterMiddleware implements Middleware {
  name = "RouterMiddleware";

  constructor(private routerService: RouterService) {}

  async request(req: HttpRequest): Promise<HttpRequest> {
    const response = await this.routerService.findRoute(req.method, req.url);
    RequestContext.setContext(req, response);
    return req;
  }

  async response(_res: HttpResponse): Promise<HttpResponse> {
    return RequestContext.getResponse();
  }
}
