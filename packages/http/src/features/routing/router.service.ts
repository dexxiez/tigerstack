import { Inject } from "@tigerstack/core/di";
import { ControllerManager } from "./controller-manager.ts";

@Inject(ControllerManager)
export class RouterService {
  constructor(private controllerManager: ControllerManager) {}

  findRoute(method: string, url: string) {
    console.log(method, url);
    const x = this.controllerManager.controllers[0].methods[0].ref();
    console.log(x);
  }
}
