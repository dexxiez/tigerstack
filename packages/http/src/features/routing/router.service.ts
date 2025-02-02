import { Inject } from "@tigerstack/core/di";
import { ControllerManager } from "./controller-manager.ts";
import { NotFoundError } from "../errors/definitions/not-found.error.ts";
import { HttpMethod } from "../../types/http.types.ts";
import { HTTP_STATUS } from "../../constants/http.ts";
import { extractParameters } from "../../decorators/params.ts";
import { ErrorService } from "../errors/error.service.ts";
import { RequestContext } from "../pipeline/request-context.ts";
@Inject(ControllerManager, ErrorService)
export class RouterService {
  constructor(
    private controllerManager: ControllerManager,
    private errorService: ErrorService,
  ) {}

  async findRoute(method: HttpMethod, url: string) {
    const [pathPart] = url.split("?");
    const normalizedUrl = pathPart === "/" ? "/" : pathPart.replace(/\/$/, "");

    for (const controller of this.controllerManager.controllers) {
      if (!normalizedUrl.startsWith(controller.path)) continue;

      const remainingPath = normalizedUrl.slice(controller.path.length) || "/";

      for (const route of controller.methods) {
        if (route.method !== method) continue;

        const match = this.matchRoute(route.methodPath, remainingPath);
        if (match) {
          try {
            const params = extractParameters(
              match.params,
              controller.ref,
              route.methodName,
            );

            // Inject user if the method has a @User() decorator
            const userParamIndex = Reflect.getMetadata(
              "userParamIndex",
              controller.ref,
              route.methodName,
            );
            if (userParamIndex !== undefined) {
              const user = RequestContext.getCustomData("user"); // Fetch user from custom data
              params[userParamIndex] = user;
            }

            const result = await route.ref.apply(controller.ref, params);
            return {
              status: HTTP_STATUS.OK,
              headers: {
                "Content-Type":
                  typeof result === "string"
                    ? "text/plain"
                    : "application/json",
              },
              body: result,
              handler: {
                target: controller.ref,
                methodName: route.methodName,
              },
            };
          } catch (error) {
            return {
              ...(await this.errorService.handle(error)),
              handler: {
                target: controller.ref,
                methodName: route.methodName,
              },
            };
          }
        }
      }
    }
    throw new NotFoundError(`No route found for ${method} ${url}`);
  }

  private matchRoute(
    routePath: string,
    requestPath: string,
  ): { params: Record<string, string>; handler: any } | null {
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
