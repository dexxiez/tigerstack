import { ErrorCode, RuntimeError } from "./types.ts";

export abstract class BaseRuntimeError extends Error implements RuntimeError {
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly fatal = false,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
  }
}
