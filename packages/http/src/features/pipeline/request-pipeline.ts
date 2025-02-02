import { HttpRequest, HttpResponse } from "../../types/http.interfaces.ts";
import { Middleware } from "./middleware.ts";
import { RequestContext } from "./request-context.ts";

export class MiddlewarePipeline {
  private middleware: Middleware[] = [];

  register(middleware: Middleware): void {
    if (this.middleware.some((m) => m.name === middleware.name)) {
      throw new Error(`Middleware ${middleware.name} already registered`);
    }
    this.middleware.push(middleware);
  }

  async execute(request: HttpRequest): Promise<HttpResponse> {
    let currentRequest = request;
    let currentResponse: HttpResponse = RequestContext.getResponse();

    // Forward pass - modify both request and response
    for (const m of this.middleware) {
      const result = await m.request(currentRequest, currentResponse);
      currentRequest = result.req;
      currentResponse = result.res;
      RequestContext.setContext(currentRequest, currentResponse);
      console.log("REQ", m.name, currentRequest, currentResponse);
    }

    // Backward pass - modify response
    for (const m of [...this.middleware].reverse()) {
      currentResponse = await m.response(currentResponse);
      RequestContext.setContext(currentRequest, currentResponse);
      console.log("RES", m.name, currentResponse);
    }

    return currentResponse;
  }

  getRegisteredMiddleware(): string[] {
    return this.middleware.map((m) => m.name);
  }
}
