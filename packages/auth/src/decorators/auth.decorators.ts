import { RequestContext } from "@tigerstack/http";
import { AuthenticatedUser } from "../types/auth.types.ts";
import { ForbiddenError, UnauthorizedError } from "../errors/auth.errors.ts";

export function RequireAuth() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = RequestContext.getRequest();
      // TODO: Fix this type
      const user = (req as any).user as undefined;

      if (!user) {
        throw new UnauthorizedError();
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export function RequireRoles(...roles: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = RequestContext.getRequest();
      const user = (req as any).user as AuthenticatedUser | undefined;

      if (!user) {
        throw new UnauthorizedError();
      }

      const hasRole = roles.some((role) => user.roles.includes(role));
      if (!hasRole) {
        throw new ForbiddenError("Insufficient roles");
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
