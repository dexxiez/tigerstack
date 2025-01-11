export interface HttpServerConfig {
  port: number;
  controllers: any[];
}

export interface HttpServer {
  use(handler: unknown): void;
  listen(port: number, callback?: () => void): void;
}
