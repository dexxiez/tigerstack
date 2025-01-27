import { AuthenticatedUser } from "../../../types/auth.types.ts";

// Interface that applications must implement
export interface UserManager {
  // Find or create user from OAuth profile
  handleOAuthUser(
    provider: string,
    profile: OAuthUserProfile,
  ): Promise<AuthenticatedUser>;

  // Optional callback: Called when user data needs refresh
  refreshUserData?(userId: string): Promise<AuthenticatedUser>;

  // Callbacks for token management
  saveTokens(
    userId: string,
    provider: string,
    tokens: OAuthTokens,
  ): Promise<void>;
  getTokens(userId: string, provider: string): Promise<OAuthTokens | null>;
  deleteTokens(userId: string, provider: string): Promise<void>;

  // Optional callback: Handle token refresh
  onTokenRefresh?(
    userId: string,
    provider: string,
    newTokens: OAuthTokens,
  ): Promise<void>;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope?: string[];
}

export interface OAuthUserProfile {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  rawProfile: Record<string, unknown>;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}
