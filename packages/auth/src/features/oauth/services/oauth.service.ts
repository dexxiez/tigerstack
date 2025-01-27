import { Inject } from "@tigerstack/core/di";
import { AuthService } from "../../../services/auth.service.ts";
import { BaseOAuthProvider } from "../providers/base.provider.ts";
import {
  OAuthTokens,
  OAuthUserProfile,
  UserManager,
} from "../types/oauth.types.ts";
import { CSRFService } from "./csrf.service.ts";
import { AuthenticatedUser } from "../../../types/auth.types.ts";

@Inject(AuthService)
export class OAuthService {
  private providers = new Map<string, BaseOAuthProvider>();
  private userManager?: UserManager;

  constructor(
    private authService: AuthService,
    private csrfService: CSRFService,
  ) {}

  registerProvider(provider: BaseOAuthProvider): void {
    this.providers.set(provider.providerName, provider);
  }

  getProvider(name: string): BaseOAuthProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`OAuth provider '${name}' not registered`);
    }
    return provider;
  }

  setUserManager(manager: UserManager): void {
    this.userManager = manager;
  }

  getAuthUrl(providerName: string): { url: string; state: string } {
    const provider = this.getProvider(providerName);
    const state = this.csrfService.generateState(providerName);
    const url = provider.getAuthUrl() + `&state=${state}`;
    return { url, state };
  }

  async handleCallback(
    providerName: string,
    code: string,
    state: string,
  ): Promise<AuthenticatedUser> {
    if (!this.csrfService.validateState(state, providerName)) {
      throw new Error("Invalid CSRF state");
    }

    const provider = this.getProvider(providerName);
    const tokens = await provider.getTokens(code);
    const profile = await provider.getUserProfile(tokens);

    // Create/update user first
    const user = await this.createOrUpdateUser(providerName, profile);

    // Then store tokens
    await this.userManager!.saveTokens(user.id, providerName, tokens);

    return user;
  }

  // New helper method for other parts of the app to get tokens
  async getProviderTokens(
    userId: string,
    providerName: string,
  ): Promise<OAuthTokens | null> {
    return this.userManager!.getTokens(userId, providerName);
  }

  private async createOrUpdateUser(
    provider: string,
    profile: OAuthUserProfile,
  ): Promise<AuthenticatedUser> {
    return this.userManager!.handleOAuthUser(provider, profile);
  }
}
