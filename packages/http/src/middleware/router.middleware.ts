import { HttpRequest, HttpResponse } from "../types/http.interfaces.ts";
import { Middleware } from "../features/pipeline/middleware.ts";
import { RouterService } from "src/features/routing/router.service.ts";
import { Inject } from "@tigerstack/core/di";

@Inject(RouterService)
export class RouterMiddleware implements Middleware {
  name = "RouterMiddleware";

  constructor(private routerService: RouterService) {}

  private routeResponse?: HttpResponse;

  async request(req: HttpRequest): Promise<HttpRequest> {
    this.routeResponse = await this.routerService.findRoute(
      req.method,
      req.url,
    );
    return req;
  }

  async response(_res: HttpResponse): Promise<HttpResponse> {
    return this.routeResponse as HttpResponse;
  }
}
