export interface HttpServerConfig {
  port: number;
  controllers: any[];
  logging?: "verbose" | false;
}

export interface HttpServer {
  use(handler: unknown): void;
  listen(port: number, callback?: () => void): void;
}
