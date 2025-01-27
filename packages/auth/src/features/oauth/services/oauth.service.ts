import { Inject } from "@tigerstack/core/di";
import { BaseOAuthProvider } from "../providers/base.provider.ts";
import {
  OAuthTokens,
  OAuthUserProfile,
  UserManager,
} from "../types/oauth.types.ts";
import {
  ProviderNotFoundError,
  InvalidStateError,
  TokenExchangeError,
} from "../errors.ts";
import { CSRFService } from "./csrf.service.ts";
import { AuthenticatedUser } from "../../../types/auth.types.ts";

@Inject(CSRFService)
export class OAuthService {
  private providers = new Map<string, BaseOAuthProvider>();
  private userManager?: UserManager;

  constructor(private csrfService: CSRFService) {}

  registerProvider(provider: BaseOAuthProvider): void {
    this.providers.set(provider.providerName, provider);
  }

  getProvider(name: string): BaseOAuthProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new ProviderNotFoundError(name);
    }
    return provider;
  }

  setUserManager(manager: UserManager): void {
    if (!manager) {
      throw new Error("UserManager cannot be null");
    }
    this.userManager = manager;
  }

  async getAuthUrl(
    providerName: string,
  ): Promise<{ url: string; state: string }> {
    const provider = this.getProvider(providerName);
    const state = this.csrfService.generateState(providerName);
    const url = (await provider.getAuthUrl()) + `&state=${state}`;
    return { url, state };
  }

  async handleCallback(
    providerName: string,
    code: string,
    state: string,
  ): Promise<AuthenticatedUser> {
    if (!this.userManager) {
      throw new Error("UserManager not configured");
    }

    if (!this.csrfService.validateState(state, providerName)) {
      throw new InvalidStateError();
    }

    const provider = this.getProvider(providerName);

    let tokens: OAuthTokens;
    try {
      tokens = await provider.getTokens(code);
    } catch (error) {
      throw new TokenExchangeError(
        providerName,
        error instanceof Error ? error.message : undefined,
      );
    }

    const profile = await provider.getUserProfile(tokens);

    // Create/update user first
    const user = await this.createOrUpdateUser(providerName, profile);

    // Then store tokens
    await this.userManager.saveTokens(user.id, providerName, tokens);

    return user;
  }

  async getProviderTokens(
    userId: string,
    providerName: string,
  ): Promise<OAuthTokens | null> {
    if (!this.userManager) {
      throw new Error("UserManager not configured");
    }
    return this.userManager.getTokens(userId, providerName);
  }

  private async createOrUpdateUser(
    provider: string,
    profile: OAuthUserProfile,
  ): Promise<AuthenticatedUser> {
    if (!this.userManager) {
      throw new Error("UserManager not configured");
    }
    return this.userManager.handleOAuthUser(provider, profile);
  }
}
