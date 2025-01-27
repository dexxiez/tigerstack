import { Inject } from "@tigerstack/core/di";
import {
  AuthenticatedUser,
  AuthenticationResult,
  JWTPayload,
  TokenType,
} from "../types/auth.types.ts";
import {
  InvalidTokenError,
  TokenExpiredError,
  UnauthorizedError,
} from "../errors/auth.errors.ts";
import jwt from "jsonwebtoken";

@Inject()
export class AuthService {
  private tokenSecret: string;
  private refreshSecret: string;

  // Default expiration times
  private readonly ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

  constructor() {
    // TODO: Move to config service
    this.tokenSecret = process.env.JWT_SECRET || "super-secret-key-change-me";
    this.refreshSecret =
      process.env.REFRESH_SECRET || "different-secret-key-change-me";
  }

  async generateTokens(user: AuthenticatedUser): Promise<AuthenticationResult> {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      type: TokenType.ACCESS,
    };

    const token = jwt.sign(payload, this.tokenSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(
      { ...payload, type: TokenType.REFRESH },
      this.refreshSecret,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY },
    );

    return {
      user,
      token,
      refreshToken,
      expiresIn: this.getExpirationTime(this.ACCESS_TOKEN_EXPIRY),
    };
  }

  async validateToken(
    token: string,
    type: TokenType = TokenType.ACCESS,
  ): Promise<AuthenticatedUser> {
    try {
      const secret =
        type === TokenType.ACCESS ? this.tokenSecret : this.refreshSecret;
      const payload = jwt.verify(token, secret) as JWTPayload;

      // Validate token type
      if (payload.type !== type) {
        throw new InvalidTokenError("Invalid token type");
      }

      // Here you'd typically look up the user in your DB
      // For now we'll just return the basic user info from the token
      return {
        id: payload.sub,
        email: payload.email,
        roles: [],
        permissions: [],
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenError(error.message);
      }
      throw new UnauthorizedError("Invalid token");
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthenticationResult> {
    const user = await this.validateToken(refreshToken, TokenType.REFRESH);
    return this.generateTokens(user);
  }

  private getExpirationTime(expiry: string): number {
    // Convert JWT time strings to seconds
    const units = { s: 1, m: 60, h: 3600, d: 86400 };
    const match = expiry.match(/(\d+)([smhd])/);
    if (!match) return 900; // Default 15m in seconds
    const [_, time, unit] = match;
    return parseInt(time) * units[unit as keyof typeof units];
  }
}
