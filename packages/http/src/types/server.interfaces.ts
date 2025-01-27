import {
  Middleware,
  MiddlewareFactory,
} from "../features/pipeline/middleware.ts";

export interface HttpServerConfig {
  port: number;
  controllers: any[];
  logging?: "verbose" | false;
  middlewareFactories?: MiddlewareFactory[];
  middleware?: Middleware[];
}

export interface HttpServer {
  use(handler: unknown): void; // Used for backend adapter
  listen(port: number, callback?: () => void): void;
}
