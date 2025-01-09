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

    // Here you'd actually handle the route and get a response
    let response: HttpResponse = {
      status: 200,
      headers: {},
      body: "Hello World",
    };

    // Backward pass through middleware
    for (const m of this.middleware.reverse()) {
      response = await m.response(response);
    }

    return response;
  }
}
