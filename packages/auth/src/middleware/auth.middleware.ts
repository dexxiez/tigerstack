import { Inject } from "@tigerstack/core/di";
import { AuthService } from "../services/auth.service.ts";
import { UnauthorizedError } from "../errors/auth.errors.ts";
import { Middleware } from "@tigerstack/http";
import { RequestContext } from "@tigerstack/http";
import { HttpResponse } from "@tigerstack/http";
import { HttpRequest } from "@tigerstack/http";

@Inject(AuthService)
export class AuthMiddleware implements Middleware {
  name = "AuthMiddleware";

  constructor(private authService: AuthService) {}

  async request(req: HttpRequest): Promise<HttpRequest> {
    const token = this.extractToken(req);

    if (!token) {
      // No token = continue as unauthenticated
      return req;
    }

    try {
      const user = await this.authService.validateToken(token);
      // Attach user to request context
      RequestContext.setContext(
        // TODO: Fix this any
        { ...req, user } as any,
        RequestContext.getResponse(),
      );
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      // Any other error, just continue as unauthenticated
    }

    return req;
  }

  async response(res: HttpResponse): Promise<HttpResponse> {
    return res;
  }

  private extractToken(req: HttpRequest): string | null {
    const authHeader = req.headers["Authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.slice(7);
  }
}
