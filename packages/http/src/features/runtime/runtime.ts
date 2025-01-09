import { Inject } from "@tigerstack/di";
import { RuntimeLogger } from "./runtime-logger.ts";
import { MiddlewarePipeline } from "../middleware/pipeline.ts";
import { HttpServer, ServerConfig } from "../../types/server.interfaces.ts";
import { Middleware } from "../middleware/middleware.ts";
import { KoaAdapter } from "../../adapters/koa/index.ts";

@Inject()
export class Runtime {
  private readonly pipeline: MiddlewarePipeline;
  private config: ServerConfig;
  private started = false;

  constructor(
    private logger: RuntimeLogger,
    private server: HttpServer,
    config: Partial<ServerConfig> = {},
  ) {
    this.pipeline = new MiddlewarePipeline();
    this.config = {
      port: config.port ?? 3000,
    };
  }

  registerMiddleware(middleware: Middleware): void {
    if (this.started) {
      throw new Error("Cannot register middleware after server has started");
    }
    this.pipeline.register(middleware);
  }

  configure(partialConfig: Partial<ServerConfig>): void {
    if (this.started) {
      this.logger.error("Cannot configure server after it has started");
      return;
    }
    this.config = { ...this.config, ...partialConfig };
  }

  getPipeline(): MiddlewarePipeline {
    return this.pipeline;
  }

  async start(): Promise<void> {
    if (this.started) {
      this.logger.error("Server already started");
      return;
    }

    // Now we're working with the abstraction, not the concrete Koa implementation
    if ("createPipelineMiddleware" in this.server) {
      const middleware = (this.server as KoaAdapter).createPipelineMiddleware(
        this.pipeline,
      );
      this.server.use(middleware);
    }

    this.server.listen(this.config.port, () => {
      this.logger.log(`Server started on port ${this.config.port}`);
    });

    this.started = true;
  }
}
