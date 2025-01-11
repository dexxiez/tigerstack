import { forwardRef, Inject } from "@tigerstack/core/di";
import { RuntimeLogger } from "../runtime/runtime-logger.ts";
import { Runtime } from "../runtime/runtime.ts";

@Inject(RuntimeLogger, forwardRef(() => Runtime))
export class ControllerManager {
  constructor(private logger: RuntimeLogger, private runtime: Runtime) {}
  findControllers() {
    const cuntrollers = this.runtime.config.controllers;
    if (cuntrollers.length === 0) {
      this.logger.warning("No Controllers Found. Have you hooked up any?");
      return;
    }
  }
}
