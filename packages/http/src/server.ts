import { inject } from "@tigerstack/di";
import { Runtime } from "./features/runtime/runtime.ts";
import { ServerConfig } from "./types/server.interfaces.ts";
import { Middleware } from "./features/middleware/middleware.ts";

export class TigerHTTP {
  private config: ServerConfig = {
    port: 3000,
  };
  private middleware: Middleware[] = [];

  setPort(port: number): this {
    this.config.port = port;
    return this;
  }

  use(middleware: Middleware): this {
    this.middleware.push(middleware);
    return this;
  }

  async start(): Promise<Runtime> {
    const runtime = await inject(Runtime);

    // Configure runtime with our saved settings
    runtime.configure(this.config);

    // Register all middleware
    this.middleware.forEach((m) => runtime.registerMiddleware(m));

    await runtime.start();
    return runtime;
  }
}
