import { Inject } from "@tigerstack/core/di";
import { Runtime } from "./features/runtime/runtime.ts";
import { HttpServerConfig } from "./types/server.interfaces.ts";
import { Middleware } from "./features/pipeline/middleware.ts";
import type { ConfigurableModule } from "@tigerstack/core";
import { RouterMiddleware } from "./middleware/router.middleware.ts";
import { BannerMiddleware } from "./middleware/banner.middleware.ts";

@Inject(Runtime, RouterMiddleware)
export class HTTPTigerMod
  implements ConfigurableModule<Partial<HttpServerConfig>>
{
  private middleware: Middleware[] = [];
  private config: Partial<HttpServerConfig> = {};

  constructor(
    private runtime: Runtime,
    private routerMiddleware: RouterMiddleware,
  ) {}

  configure(config: Partial<HttpServerConfig>): void {
    this.config = config;
  }

  use(middleware: Middleware): this {
    this.middleware.push(middleware);
    return this;
  }

  async onBootstrap(): Promise<void> {
    await this.runtime.initialize();
    this.runtime.configure(this.config);

    this.getInternalMiddleware().map((m) => this.runtime.registerMiddleware(m));
    this.middleware.map((m) => this.runtime.registerMiddleware(m));

    return this.runtime.start();
  }

  private getInternalMiddleware(): Middleware[] {
    return [new BannerMiddleware(), this.routerMiddleware];
  }
}
