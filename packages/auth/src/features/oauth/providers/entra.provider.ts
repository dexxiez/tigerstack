import axios from "axios";
import { DIError } from "@tigerstack/core/di";
import {
  OAuthConfig,
  OAuthTokens,
  OAuthUserProfile,
} from "../types/oauth.types.ts";
import { BaseOAuthProvider } from "./base.provider.ts";

export type EntraAuthConfig = OAuthConfig & {
  tenant?: string;
};

export class MicrosoftEntraProvider extends BaseOAuthProvider<EntraAuthConfig> {
  private readonly AUTH_URL: string;
  private readonly TOKEN_URL: string;
  private readonly API_URL = "https://graph.microsoft.com/v1.0";

  constructor(config: EntraAuthConfig) {
    const finalConfig = {
      ...config,
      scope: config.scope || ["User.Read"],
      tenant: config.tenant || "common", // Allow multi-tenant by default
    };
    super(finalConfig);

    this.AUTH_URL = `https://login.microsoftonline.com/${this.config.tenant}/oauth2/v2.0/authorize`;
    this.TOKEN_URL = `https://login.microsoftonline.com/${this.config.tenant}/oauth2/v2.0/token`;
  }

  get providerName(): string {
    return "microsoft-entra";
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: this.config.scope!.join(" "),
      response_type: "code",
      response_mode: "query",
    });
    return `${this.AUTH_URL}?${params.toString()}`;
  }

  async getTokens(code: string): Promise<OAuthTokens> {
    try {
      const { data } = await axios.post(
        this.TOKEN_URL,
        new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.callbackUrl,
          grant_type: "authorization_code",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DIError(
          `Microsoft Entra OAuth error: ${
            error.response?.statusText || error.message
          }`,
        );
      }
      throw error;
    }
  }

  async getUserProfile(tokens: OAuthTokens): Promise<OAuthUserProfile> {
    try {
      const { data: profile } = await axios.get(`${this.API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          Accept: "application/json",
        },
      });

      return {
        id: profile.id,
        email: profile.mail || profile.userPrincipalName,
        name: profile.displayName,
        avatarUrl: undefined, // Microsoft Graph API requires additional permissions for photo
        rawProfile: profile,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DIError(
          `Microsoft Graph API error: ${
            error.response?.statusText || error.message
          }`,
        );
      }
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const { data } = await axios.post(
        this.TOKEN_URL,
        new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
          scope: this.config.scope!.join(" "),
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DIError(
          `Microsoft Entra token refresh error: ${
            error.response?.statusText || error.message
          }`,
        );
      }
      throw error;
    }
  }
}
