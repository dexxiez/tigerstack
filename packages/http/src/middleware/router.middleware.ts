import { HttpRequest, HttpResponse } from "../types/http.interfaces.ts";
import { Middleware } from "../features/pipeline/middleware.ts";
import { RouterService } from "../features/routing/router.service.ts";
import { Inject } from "@tigerstack/core/di";
import { RequestContext } from "src/features/pipeline/request-context.ts";

@Inject(RouterService)
export class RouterMiddleware implements Middleware {
  name = "RouterMiddleware";

  constructor(private routerService: RouterService) {}

  async request(
    req: HttpRequest,
    _res: HttpResponse,
  ): Promise<{ req: HttpRequest; res: HttpResponse }> {
    const response = await this.routerService.findRoute(req.method, req.url);

    // Attach the controller class and method name to the request
    const reqWithRoute = {
      ...req,
      handler: (response as any).handler,
    };

    RequestContext.setContext(reqWithRoute, response);
    return { req: reqWithRoute, res: response };
  }

  async response(res: HttpResponse): Promise<HttpResponse> {
    return res;
  }
}
