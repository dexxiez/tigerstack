import { Inject } from "@tigerstack/core/di";
import { AuthService } from "../services/auth.service.ts";
import { AuthMiddleware } from "./auth.middleware.ts";
import { MiddlewareFactory, Middleware } from "@tigerstack/http";

@Inject(AuthService)
export class AuthMiddlewareFactory implements MiddlewareFactory {
  constructor(private authService: AuthService) {}

  async create(): Promise<Middleware> {
    return new AuthMiddleware(this.authService);
  }
}
