import { BaseRuntimeError } from "./base-error.ts";

export class FrameworkErrorHandler {
  static handle(error: unknown) {
    if (error instanceof BaseRuntimeError) {
      console.error(error.message);
      if (error.fatal) {
        process.exit(1);
      }
    }
  }
}
