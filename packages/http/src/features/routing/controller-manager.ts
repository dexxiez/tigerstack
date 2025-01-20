import { forwardRef, inject, Inject } from "@tigerstack/core/di";
import { RuntimeLogger } from "../runtime/runtime-logger.ts";
import { Runtime } from "../runtime/runtime.ts";
import { MetadataManager } from "@tigerstack/core/internals";
import Table from "cli-table3";
import { HttpMethod } from "../../types/http.types.ts";

type Handler = (...args: any[]) => any;

interface RouteInfo {
  method: HttpMethod;
  methodPath: string;
  methodName: string;
  ref: Handler;
}

interface ControllerListEntry {
  name: string;
  path: string;
  methods: RouteInfo[];
  ref: Handler;
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

  async loadControllers() {
    const cuntrollers = this.runtime.config.controllers;
    if (cuntrollers.length === 0) {
      this.logger.warning("No Controllers Found. Have you hooked up any?");
      return;
    }

    await this.checkAndProcessControllers(cuntrollers);
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

  private async checkAndProcessControllers(controllers: any[]): Promise<void> {
    this.invalidControllers = [
      ...this.invalidControllers,
      ...controllers
        .filter((ctrl) => !this.isController(ctrl))
        .map((ctrl) => ({
          name: ctrl?.name || "Unknown Class",
          reason: "Not a controller",
        })),
    ];

    const validControllerPromises = controllers
      .filter(this.isController)
      .map(async (controllerClass) => {
        const info = this.getControllerInformation(controllerClass);

        // Early returns for invalid cases
        if (!info || info.routePath.trim() === "") {
          this.invalidControllers.push({
            name: info?.name || "Unknown Class",
            reason: "Route path cannot be empty",
          });
          return null;
        }

        if (info.routePath.charAt(0) !== "/") {
          this.invalidControllers.push({
            name: info.name,
            reason: "Route path has to start with a /",
          });
          return null;
        }

        try {
          // Create instance through the DI system
          const instance = await inject(controllerClass);
          if (!instance) {
            throw new Error(`Failed to instantiate controller ${info.name}`);
          }

          const methods = this.crawlControllerRoutes({
            prototype: controllerClass.prototype,
            ref: instance,
          });

          return {
            name: info.name,
            path: info.routePath.trim(),
            ref: instance as Handler,
            methods,
          };
        } catch (error) {
          this.logger.error(
            `Failed to instantiate controller ${info.name}: ${error}`,
          );
          this.invalidControllers.push({
            name: info.name,
            reason: `Instantiation failed: ${error}`,
          });
          return null;
        }
      });

    // Wait for all promises to resolve and filter out nulls
    this.controllers = (await Promise.all(validControllerPromises)).filter(
      (ctrl): ctrl is NonNullable<typeof ctrl> => ctrl !== null,
    );
  }

  private crawlControllerRoutes(controller: {
    prototype: any;
    ref: any;
  }): RouteInfo[] {
    const { prototype } = controller;
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (prop) => prop !== "constructor",
    );

    const methods = methodNames
      .map((name) => ({
        method: MetadataManager.getMetadata("httpMethod", prototype, name),
        methodPath: MetadataManager.getMetadata("routePath", prototype, name),
        methodName: name,
        ref: prototype[name].bind(controller.ref),
      }))
      .filter((m) => !MetadataManager.isBlankObject(m.method))
      .filter((m) => !MetadataManager.isBlankObject(m.methodPath));

    return methods;
  }

  private reportControllers(): void {
    if (this.invalidControllers.length === 0) return;

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

    this.logger.error("There were invalid controllers found, check the logs");
  }
  private isController(ctrl: any): boolean {
    return MetadataManager.getMetadata("type", ctrl) === "controller";
  }
}
