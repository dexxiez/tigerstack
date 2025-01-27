import {
  OAuthConfig,
  OAuthUserProfile,
  OAuthTokens,
} from "../types/oauth.types.ts";

export abstract class BaseOAuthProvider<T extends OAuthConfig = OAuthConfig> {
  constructor(protected config: T) {}

  abstract get providerName(): string;

  abstract getAuthUrl(): string;

  abstract getTokens(code: string): Promise<OAuthTokens>;

  abstract getUserProfile(tokens: OAuthTokens): Promise<OAuthUserProfile>;
}
