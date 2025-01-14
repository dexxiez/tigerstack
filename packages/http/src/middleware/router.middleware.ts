import { HttpRequest, HttpResponse } from "../types/http.interfaces.ts";
import { Middleware } from "../features/pipeline/middleware.ts";
import { RouterService } from "src/features/routing/router.service.ts";
import { Inject } from "@tigerstack/core/di";
import { HTTP_STATUS } from "src/constants/http.ts";

@Inject(RouterService)
export class RouterMiddleware implements Middleware {
  name = "RouterMiddleware";
  constructor(private routerService: RouterService) {}

  async request(req: HttpRequest): Promise<HttpRequest> {
    this.routerService.findRoute(req.method, req.url);
    return req;
  }

  async response(res: HttpResponse): Promise<HttpResponse> {
    return {
      ...res,
      status: HTTP_STATUS.MR_IS_TEAPOT,
      body: { message: "Hello from RouterMiddleware" },
    };
  }
}
