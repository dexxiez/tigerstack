import { HTTP_STATUS } from "src/constants/http.ts";
import { HttpRequest, HttpResponse } from "../../types/http.interfaces.ts";
import { Middleware } from "./middleware.ts";

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

    // Forward pass through middleware
    for (const m of this.middleware) {
      currentRequest = await m.request(currentRequest);
    }

    let response: HttpResponse = {
      status: HTTP_STATUS.MR_IS_TEAPOT,
      headers: {
        "Content-Type": "text/plain",
      },
      body: "Oh, no. Anyway.",
    };

    // Backward pass through middleware
    for (const m of this.middleware.reverse()) {
      response = await m.response(response);
    }

    return response;
  }
}
