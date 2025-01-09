export interface ServerConfig {
  port: number;
}

export interface HttpServer {
  use(handler: unknown): void;
  listen(port: number, callback?: () => void): void;
}
