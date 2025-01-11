import { forwardRef, Inject } from "@tigerstack/core/di";
import { RuntimeLogger } from "../runtime/runtime-logger.ts";
import { Runtime } from "../runtime/runtime.ts";
import { MetadataManager } from "@tigerstack/core/internals";
import Table from "cli-table3";

interface ControllerListEntry {
  name: string;
  path: string;
}

interface InvalidController {
  name: string;
  reason: string;
}

interface ControllerInformation {
  name: string;
  routePath: string;
}

@Inject(RuntimeLogger, forwardRef(() => Runtime))
export class ControllerManager {
  controllers: ControllerListEntry[];
  invalidControllers: InvalidController[];

  constructor(private logger: RuntimeLogger, private runtime: Runtime) {
    this.controllers = [];
    this.invalidControllers = [];
  }

  loadControllers() {
    const cuntrollers = this.runtime.config.controllers;
    if (cuntrollers.length === 0) {
      this.logger.warning("No Controllers Found. Have you hooked up any?");
      return;
    }

    this.checkAndProcessControllers(cuntrollers);
    this.reportControllers();
  }

  getControllerInformation(ctrl: any): ControllerInformation | null {
    if (!this.isController(ctrl)) {
      return null;
    }

    const routePath = MetadataManager.getMetadata("routePath", ctrl);

    return {
      name: ctrl.name,
      routePath,
    };
  }

  private checkAndProcessControllers(cuntrollers: any[]): void {
    this.invalidControllers = [
      ...this.invalidControllers,
      ...cuntrollers
        .filter((ctrl) => !this.isController(ctrl))
        .map((ctrl) => ({
          name: ctrl?.name || "Unknown Class",
          reason: "Not a controller",
        })),
    ];

    this.controllers = cuntrollers
      .filter(this.isController)
      .map((clr) => {
        const info = this.getControllerInformation(clr);
        if (info?.routePath.trim() === "") {
          this.invalidControllers.push({
            name: info?.name || "Unknown Class",
            reason: "Route path cannot be empty",
          });
          return;
        }

        if (info?.routePath.charAt(0) !== "/") {
          this.invalidControllers.push({
            name: info?.name || "Unknown Class",
            reason: "Route path has to start with a /",
          });
          return;
        }

        return {
          name: info.name,
          path: info.routePath.trim(),
        };
      })
      .filter((ctrl) => ctrl !== undefined);
  }

  private reportControllers(): void {
    const invalidTable = new Table({
      head: ["Invalid Controller Name", "Reason"],
      style: {
        head: ["red"],
        compact: true,
        border: ["grey"],
      },
    });

    this.invalidControllers.forEach((ctrl) => {
      invalidTable.push([ctrl.name, ctrl.reason]);
    });

    console.info(invalidTable.toString());

    if (this.invalidControllers.length > 0)
      this.logger.error("There were invalid controllers found, check the logs");
  }
  private isController(ctrl: any): boolean {
    return MetadataManager.getMetadata("type", ctrl) === "controller";
  }
}
