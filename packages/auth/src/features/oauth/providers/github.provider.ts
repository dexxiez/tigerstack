import axios from "axios";
import { DIError } from "@tigerstack/core/di";
import {
  OAuthConfig,
  OAuthTokens,
  OAuthUserProfile,
} from "../types/oauth.types.ts";
import { BaseOAuthProvider } from "./base.provider.ts";

export class GithubProvider extends BaseOAuthProvider {
  private readonly AUTH_URL = "https://github.com/login/oauth/authorize";
  private readonly TOKEN_URL = "https://github.com/login/oauth/access_token";
  private readonly API_URL = "https://api.github.com";

  constructor(config: OAuthConfig) {
    const finalConfig = {
      ...config,
      scope: config.scope || ["read:user", "user:email"],
    };
    super(finalConfig);
  }

  get providerName(): string {
    return "github";
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: this.config.scope!.join(" "),
      response_type: "code",
    });
    return `${this.AUTH_URL}?${params.toString()}`;
  }

  async getTokens(code: string): Promise<OAuthTokens> {
    try {
      const { data } = await axios.post(
        this.TOKEN_URL,
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.callbackUrl,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      return {
        accessToken: data.access_token,
        expiresIn: undefined, // GitHub doesn't provide refresh tokens in basic OAuth flow
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DIError(
          `GitHub OAuth error: ${error.response?.statusText || error.message}`,
        );
      }
      throw error;
    }
  }

  async getUserProfile(tokens: OAuthTokens): Promise<OAuthUserProfile> {
    try {
      const { data: profile } = await axios.get(`${this.API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          Accept: "application/json",
        },
      });

      let email = profile.email;
      if (!email && this.config.scope!.includes("user:email")) {
        email = await this.getPrimaryEmail(tokens.accessToken);
      }

      return {
        id: profile.id.toString(),
        email,
        name: profile.name || profile.login,
        avatarUrl: profile.avatar_url,
        rawProfile: profile,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DIError(
          `GitHub API error: ${error.response?.statusText || error.message}`,
        );
      }
      throw error;
    }
  }

  private async getPrimaryEmail(
    accessToken: string,
  ): Promise<string | undefined> {
    try {
      const { data: emails } = await axios.get(`${this.API_URL}/user/emails`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      const primaryEmail = emails.find(
        (e: { primary: boolean; email: string }) => e.primary,
      );
      return primaryEmail?.email;
    } catch {
      return undefined;
    }
  }
}
