import {
  OAuthConfig,
  OAuthUserProfile,
  OAuthTokens,
} from "../types/oauth.types.ts";

export abstract class BaseOAuthProvider {
  constructor(protected config: OAuthConfig) {}

  abstract get providerName(): string;

  abstract getAuthUrl(): string;

  abstract getTokens(code: string): Promise<OAuthTokens>;

  abstract getUserProfile(tokens: OAuthTokens): Promise<OAuthUserProfile>;
}
