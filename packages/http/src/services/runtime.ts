import { Inject } from "@tigerstack/di";
import koa from "koa";
import { RuntimeLogger } from "./runtime-logger.ts";
import { GoodMiddleware } from "..//interfaces/middleware.ts";
import { handleRequest, handleResponse } from "./utils/handle-req-res.ts";

@Inject(RuntimeLogger)
export class Runtime {
  private readonly _server: koa;
  private _port: number;
  private _started: boolean;
  private _globalMiddleware: GoodMiddleware[];

  constructor(private logger: RuntimeLogger) {
    this._port = 3000;
    this._server = new koa();
    this._started = false;
    this._globalMiddleware = [];
  }

  setPort(port: number) {
    if (this._started) {
      throw new Error("Server already started");
    }

    this._port = port;
  }

  registerMiddleware(middleware: GoodMiddleware) {
    if (this._globalMiddleware.some((x) => x.name === middleware.name)) {
      this.logger.error(
        `Middleware ${middleware.name} has already been registered globally and will be ignored`,
      );
      return;
    }

    this._globalMiddleware.push(middleware);
  }

  start() {
    this._loadMiddleware();

    this._server.use((ctx) => {
      ctx.body = "FUCK MOI";
    });

    this._server.listen(this._port, () => {
      this._started = true;
      this.logger.log("Server done the starts good, BIG DEAL!");
      this.logger.debug(`MIDDLEWARE LOADED: ${this._globalMiddleware.length}`);
    });
  }

  private _loadMiddleware() {
    this._globalMiddleware.forEach((m) => {
      this._server.use(async (ctx, nek) => {
        await m.request(handleRequest(ctx.request));
        await nek();
        const res = await m.response(handleResponse(ctx.response));

        Object.entries(res.headers).forEach(([key, value]) => {
          ctx.res.setHeader(key, value);
        });

        ctx.res.statusCode = res.status;
      });
    });
  }
}
