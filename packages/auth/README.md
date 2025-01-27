# @tigerstack/auth

A powerful, flexible authentication system for TypeScript applications with built-in JWT support and OAuth2 integration.

## Installation

```bash
npm install @tigerstack/auth
# or
pnpm add @tigerstack/auth
```

## Quick Start

Here's how to get basic JWT authentication up and running in your app:

```typescript
import { AuthService, AuthMiddleware } from "@tigerstack/auth";
import { Inject } from "@tigerstack/core/di";

// 1. Set up your auth service
@Inject(AuthService)
class MyApp {
  constructor(private authService: AuthService) {}

  async login(email: string, password: string) {
    // Validate credentials (implement your own logic)
    const user = await validateUser(email, password);

    // Generate JWT tokens
    const { token, refreshToken } = await this.authService.generateTokens({
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    });

    return { token, refreshToken };
  }
}

// 2. Add the auth middleware to your HTTP stack
app.use(AuthMiddleware);

// 3. Protect your routes with decorators
class UserController {
  @RequireAuth()
  async getProfile() {
    // Only authenticated users can access this
  }

  @RequireRoles("admin")
  async adminOnly() {
    // Only users with 'admin' role can access this
  }
}
```

## OAuth2 Integration

The auth package includes a robust OAuth2 system supporting multiple providers:

```typescript
import {
  OAuthService,
  GithubProvider,
  MicrosoftEntraProvider,
} from "@tigerstack/auth/oauth";

@Inject(OAuthService)
class AuthController {
  constructor(private oauth: OAuthService) {
    // Set up OAuth providers
    this.oauth.registerProvider(
      new GithubProvider({
        clientId: "your-client-id",
        clientSecret: "your-client-secret",
        callbackUrl: "http://localhost:3000/auth/github/callback",
      }),
    );
  }

  // Initiate OAuth flow
  async startAuth(provider: string) {
    const { url } = this.oauth.getAuthUrl(provider);
    return { redirectUrl: url };
  }

  // Handle OAuth callback
  async handleCallback(provider: string, code: string, state: string) {
    const user = await this.oauth.handleCallback(provider, code, state);
    return this.authService.generateTokens(user);
  }
}
```

### Implementing User Management

You'll need to implement the `UserManager` interface to handle OAuth user creation/updates:

```typescript
import { UserManager, OAuthUserProfile } from "@tigerstack/auth/oauth";

class MyUserManager implements UserManager {
  async handleOAuthUser(provider: string, profile: OAuthUserProfile) {
    // Find or create user based on OAuth profile
    const user = await db.users.findOrCreate({
      where: {
        providerId: profile.id,
        provider,
      },
      defaults: {
        email: profile.email,
        name: profile.name,
      },
    });

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };
  }

  async saveTokens(userId: string, provider: string, tokens: OAuthTokens) {
    // Store OAuth tokens
    await db.oauthTokens.upsert({
      userId,
      provider,
      ...tokens,
    });
  }

  // ... implement other required methods
}

// Register your user manager
oauthService.setUserManager(new MyUserManager());
```

## Error Handling

The package provides standard error classes for common auth scenarios:

```typescript
import {
  UnauthorizedError,
  ForbiddenError,
  TokenExpiredError,
  InvalidTokenError,
} from "@tigerstack/auth";

try {
  await authService.validateToken(token);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    // Handle expired token
  } else if (error instanceof InvalidTokenError) {
    // Handle invalid token
  }
}
```

## Advanced Usage

### Custom Token Configuration

You can customize token expiration and secrets:

```typescript
@Inject()
class CustomAuthService extends AuthService {
  constructor() {
    super();
    // Override default token settings
    this.ACCESS_TOKEN_EXPIRY = "30m"; // 30 minutes
    this.REFRESH_TOKEN_EXPIRY = "14d"; // 14 days

    // Use environment variables for secrets
    this.tokenSecret = process.env.JWT_SECRET!;
    this.refreshSecret = process.env.REFRESH_SECRET!;
  }
}
```

### Role-Based Access Control

The auth system supports fine-grained role-based access control:

```typescript
class AdminController {
  @RequireRoles("admin", "superuser")
  async sensitiveOperation() {
    // Only users with admin OR superuser role can access
  }
}
```

### Refresh Token Flow

Implement token refresh to maintain user sessions:

```typescript
@Inject(AuthService)
class AuthController {
  async refreshUserSession(refreshToken: string) {
    try {
      const result = await this.authService.refreshTokens(refreshToken);
      return {
        token: result.token,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      };
    } catch (error) {
      // Handle invalid/expired refresh token
      throw new UnauthorizedError("Invalid refresh token");
    }
  }
}
```

## Best Practices

1. **Never store tokens in localStorage** - Use HTTP-only cookies for token storage.
2. **Implement rate limiting** - Protect auth endpoints from brute force attacks.
3. **Use environment variables** for all secrets and OAuth credentials.
4. **Implement token revocation** - Build a way to invalidate tokens when needed.
5. **Monitor token usage** - Log auth failures and suspicious patterns.

## Type Reference

Key types for TypeScript integration:

```typescript
interface AuthenticatedUser {
  id: string;
  roles: string[];
  permissions: string[];
  [key: string]: any;
}

interface AuthenticationResult {
  user: AuthenticatedUser;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface OAuthUserProfile {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  rawProfile: Record<string, unknown>;
}
```
