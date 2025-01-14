import { Inject } from "@tigerstack/core/di";
import { RuntimeLogger } from "./runtime-logger.ts";
import { MiddlewarePipeline } from "../pipeline/request-pipeline.ts";
import { HttpServer, HttpServerConfig } from "../../types/server.interfaces.ts";
import { Middleware } from "../pipeline/middleware.ts";
import { KoaAdapter } from "../../adapters/koa/index.ts";
import { defaultConfig } from "./runtime-defaults.ts";
import { ControllerManager } from "../routing/controller-manager.ts";
import { ErrorService } from "../errors/error.service.ts";

@Inject(RuntimeLogger, ControllerManager, ErrorService)
export class Runtime {
  private readonly pipeline: MiddlewarePipeline;
  private server?: HttpServer;
  config: HttpServerConfig = defaultConfig;
  private started = false;

  constructor(
    private logger: RuntimeLogger,
    private controllerManager: ControllerManager,
    private errorService: ErrorService,
  ) {
    this.pipeline = new MiddlewarePipeline();
  }

  async initialize() {
    this.server = await KoaAdapter.create(this.errorService);
  }

  registerMiddleware(middleware: Middleware): void {
    if (this.started) {
      throw new Error("Cannot register middleware after server has started");
    }
    this.pipeline.register(middleware);
  }

  configure(partialConfig: Partial<HttpServerConfig>): void {
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
    if (!this.server) {
      throw new Error("Server not initialized");
    }

    if (this.started) {
      this.logger.error("Server already started");
      return;
    }

    await this.controllerManager.loadControllers();

    if ("createPipeline" in this.server) {
      const middleware = (this.server as KoaAdapter).createPipeline(
        this.pipeline,
      );
      try {
        this.server.use(middleware);
      } catch (e) {
        this.logger.error(`Error while applying middleware to server: ${e}`);
      }
    }

    this.server.listen(this.config.port, () => {
      this.logger.log(`Server started on port ${this.config.port}`);
    });

    this.started = true;
  }
}
