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
    this.runtime.configure(this.config);

    const internalMiddleware = this.getInternalMiddleware();
    const externalMiddleware = await this.getExternalMiddleware();

    [
      ...internalMiddleware,
      ...externalMiddleware,
      this.routerMiddleware,
    ].forEach((m) => this.runtime.registerMiddleware(m));

    await this.runtime.initialize();
    return this.runtime.start();
  }

  private getInternalMiddleware(): Middleware[] {
    return [new BannerMiddleware()];
  }

  private async getExternalMiddleware(): Promise<Middleware[]> {
    const standaloneMiddleware = this.config.middleware || [];

    // Wait for all factories to create their middleware
    const factoryMiddleware = await Promise.all(
      (this.config.middlewareFactories || []).map((factory) =>
        factory.create(),
      ),
    );

    return [...factoryMiddleware, ...standaloneMiddleware];
  }
}
