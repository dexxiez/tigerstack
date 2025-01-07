import { inject } from "@tigerstack/di";
import { Runtime } from "./services/runtime.ts";
import { AssertDominanceMiddleware } from "./middleware/assert-dominance.ts";

export class TigerHTTP {
  private port: number;

  constructor(port: number) {
    this.port = port;
  }
  public async start() {
    const server = await inject(Runtime);
    server.registerMiddleware(new AssertDominanceMiddleware());
    server.registerMiddleware(new AssertDominanceMiddleware());
    server.setPort(this.port);
    server.start();
  }
}
