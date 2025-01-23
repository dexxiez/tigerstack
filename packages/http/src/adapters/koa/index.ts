import type { Context, Next } from "koa";
import type Koa from "koa";
import type { HttpRequest, HttpResponse } from "../../types/http.interfaces.ts";
import type { HttpServer } from "../../types/server.interfaces.ts";
import { MiddlewarePipeline } from "../../features/pipeline/request-pipeline.ts";
import { HttpErrorHandler } from "../../types/http-error-handler.interface.ts";
import { v4 } from "uuid";

export class KoaAdapter implements HttpServer {
  private server: Koa | undefined;
  private httpErrorHandler: HttpErrorHandler;

  static async create(httpErrorHandler: HttpErrorHandler): Promise<KoaAdapter> {
    const adapter = new KoaAdapter(httpErrorHandler);
    const { default: Koa } = await import("koa");
    const { default: bodyParser } = await import("koa-bodyparser");
    adapter.server = new Koa();
    adapter.server.use(bodyParser());
    return adapter;
  }

  static handleRequest(ctx: Context): HttpRequest {
    return {
      method: ctx.method as HttpRequest["method"],
      headers: ctx.headers as HttpRequest["headers"],
      url: ctx.url,
      body: ctx.request.body,
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

  private constructor(httpErrorHandler: HttpErrorHandler) {
    this.httpErrorHandler = httpErrorHandler;
  }

  use(handler: unknown): void {
    if (!this.server) {
      throw new Error("Koa Server not initialized");
    }
    this.server.use(handler as Koa.Middleware);
  }

  listen(port: number, callback: () => void): void {
    if (!this.server) {
      throw new Error("Koa Server not initialized");
    }
    this.server.listen(port, callback);
  }

  createPipeline(pipeline: MiddlewarePipeline) {
    return async (ctx: Context, next: Next) => {
      this.addRequestId(ctx);
      try {
        const req = KoaAdapter.handleRequest(ctx);
        const res = await pipeline.execute(req);
        KoaAdapter.handleResponse(ctx, res);
        await next();
      } catch (error) {
        const errRes = await this.httpErrorHandler.handle(error, ctx);
        KoaAdapter.handleResponse(ctx, errRes);
      }
    };
  }

  private addRequestId(ctx: Context): void {
    ctx.set("X-Request-Id", v4());
  }
}
