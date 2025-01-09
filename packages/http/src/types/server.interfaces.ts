import { Constructor } from "@tigerstack/core/di";

export interface HttpServerConfig {
  port: number;
  controllers: Constructor<unknown>[];
}

export interface HttpServer {
  use(handler: unknown): void;
  listen(port: number, callback?: () => void): void;
}
