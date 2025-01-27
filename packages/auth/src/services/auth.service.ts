import { Inject } from "@tigerstack/core/di";
import {
  AuthenticatedUser,
  AuthenticationResult,
} from "../types/auth.types.ts";
import { UnauthorizedError } from "../errors/auth.errors.ts";

@Inject()
export class AuthService {
  private tokenSecret: string;

  constructor() {
    // TODO: Move to config
    this.tokenSecret = process.env.JWT_SECRET || "super-secret-key-change-me";
  }

  async validateToken(token: string): Promise<AuthenticatedUser> {
    try {
      // TODO: Implement JWT validation
      throw new UnauthorizedError("Token validation not implemented");
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
  }

  async generateTokens(user: AuthenticatedUser): Promise<AuthenticationResult> {
    // TODO: Implement JWT generation
    return {
      user,
      token: "dummy-token",
      refreshToken: "dummy-refresh-token",
    };
  }
}
