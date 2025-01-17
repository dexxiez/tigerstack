import { Inject } from "@tigerstack/core/di";
import { ControllerManager } from "./controller-manager.ts";
import { NotFoundError } from "../errors/definitions/not-found.error.ts";
import { HttpMethod } from "../../types/http.types.ts";
import { HttpResponse } from "../../types/http.interfaces.ts";
import { HTTP_STATUS } from "../../constants/http.ts";

interface RouteMatch {
  handler: (...args: any[]) => any;
  params: Record<string, string>;
}

@Inject(ControllerManager)
export class RouterService {
  constructor(private controllerManager: ControllerManager) {}

  async findRoute(method: HttpMethod, url: string): Promise<HttpResponse> {
    const normalizedUrl = url === "/" ? "/" : url.replace(/\/$/, "");

    for (const controller of this.controllerManager.controllers) {
      // First check if URL starts with controller base path
      if (!normalizedUrl.startsWith(controller.path)) continue;

      // Get the remaining path after the controller base
      const remainingPath = normalizedUrl.slice(controller.path.length) || "/";

      for (const route of controller.methods) {
        if (route.method !== method) continue;

        const match = this.matchRoute(route.methodPath, remainingPath);
        if (match) {
          const result = await route.ref(match.params);
          return {
            status: HTTP_STATUS.ACCEPTED,
            headers: {
              "Content-Type":
                typeof result === "string" ? "text/plain" : "application/json",
            },
            body: result,
          };
        }
      }
    }

    throw new NotFoundError(`No route found for ${method} ${url}`);
  }

  private matchRoute(
    routePath: string,
    requestPath: string,
  ): RouteMatch | null {
    const routeParts = routePath.split("/").filter(Boolean);
    const requestParts = requestPath.split("/").filter(Boolean);

    if (routeParts.length !== requestParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    // Check each part of the path
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const requestPart = requestParts[i];

      // Check if this is a parameter
      if (routePart.startsWith(":")) {
        // Store the parameter
        params[routePart.slice(1)] = requestPart;
        continue;
      }

      // Not a parameter, must match exactly
      if (routePart !== requestPart) {
        return null;
      }
    }

    return { params, handler: () => ({}) };
  }
}
