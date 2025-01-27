import { Inject } from "@tigerstack/core/di";
import crypto from "node:crypto";

@Inject()
export class CSRFService {
  private stateMap = new Map<string, { provider: string; expiry: number }>();
  private readonly STATE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  generateState(provider: string): string {
    const state = crypto.randomBytes(32).toString("hex");
    this.stateMap.set(state, {
      provider,
      expiry: Date.now() + this.STATE_TIMEOUT,
    });
    return state;
  }

  validateState(state: string, provider: string): boolean {
    const stored = this.stateMap.get(state);
    if (!stored) return false;

    // Clean up expired states while we're here
    this.cleanupExpiredStates();

    // Check if state is valid and not expired
    if (stored.provider !== provider || Date.now() > stored.expiry) {
      this.stateMap.delete(state);
      return false;
    }

    // Valid state, remove it since it's one-time use
    this.stateMap.delete(state);
    return true;
  }

  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [state, data] of this.stateMap.entries()) {
      if (now > data.expiry) {
        this.stateMap.delete(state);
      }
    }
  }
}
