import type { Context, Next } from "koa";
import type Koa from "koa";
import type { HttpRequest, HttpResponse } from "../../types/http.interfaces.ts";
import type { HttpServer } from "../../types/server.interfaces.ts";
import { MiddlewarePipeline } from "../../features/middleware/pipeline.ts";

export class KoaAdapter implements HttpServer {
  private server: Koa;

  constructor() {
    const Koa = require("koa");
    this.server = new Koa();
  }

  static handleRequest(ctx: Context): HttpRequest {
    return {
      method: ctx.method as HttpRequest["method"],
      headers: ctx.headers as HttpRequest["headers"],
      url: ctx.url,
      body: ctx.request.toJSON(),
    };
  }

  static handleResponse(ctx: Context, response: HttpResponse): void {
    Object.entries(response.headers).forEach(([key, value]) => {
      if (!value) return;
      ctx.set(key, value);
    });
    ctx.status = response.status;
    ctx.body = response.body;
  }

  use(handler: unknown): void {
    this.server.use(handler as Koa.Middleware);
  }

  listen(port: number, callback: () => void): void {
    this.server.listen(port, callback);
  }

  createPipelineMiddleware(pipeline: MiddlewarePipeline) {
    return async (ctx: Context, next: Next) => {
      const req = KoaAdapter.handleRequest(ctx);
      const res = await pipeline.execute(req);
      KoaAdapter.handleResponse(ctx, res);
      await next();
    };
  }
}
