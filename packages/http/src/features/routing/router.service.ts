import { Inject } from "@tigerstack/core/di";
import { ControllerManager } from "./controller-manager.ts";
import { NotFoundError } from "../errors/definitions/not-found.error.ts";
import { HttpMethod } from "../../types/http.types.ts";
import { HttpResponse } from "../../types/http.interfaces.ts";
import { HTTP_STATUS } from "../../constants/http.ts";
import { extractParameters } from "../../decorators/params.ts";

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
          try {
            const params = extractParameters(
              match.params,
              controller.ref, // Key change here - use instance instead of ref
              route.methodName,
            );

            const result = await route.ref.apply(controller.ref, params);
            return {
              status: HTTP_STATUS.OK, // Changed from ACCEPTED to OK
              headers: {
                "Content-Type":
                  typeof result === "string"
                    ? "text/plain"
                    : "application/json",
              },
              body: result,
            };
          } catch (error) {
            console.error("Error handling route:", error);
            throw error; // Re-throw to be handled by error middleware
          }
        }
      }
    }

    throw new NotFoundError(`No route found for ${method} ${url}`);
  }

  private matchRoute(
    routePath: string,
    requestPath: string,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  ): { params: Record<string, string>; handler: Function } | null {
    // Handle root path special case
    if (routePath === "/" && requestPath === "/") {
      return { params: {}, handler: () => ({}) };
    }

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
