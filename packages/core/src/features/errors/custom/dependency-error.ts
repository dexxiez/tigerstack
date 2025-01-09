import { BaseRuntimeError } from "../base-error.ts";

export class DependencyError extends BaseRuntimeError {
  constructor(
    public readonly dependency: string,
    public readonly originalError?: Error,
    fatal = false,
  ) {
    const message =
      `Missing required dependency: ${dependency}\n` +
      `Please install it first: npm install ${dependency}` +
      (originalError ? `\nOriginal error: ${originalError.message}` : "");

    super(message, "ERR_MISSING_DEPENDENCY", fatal);
  }
}
