import { Constructor } from "./types.ts";
import { DIError, CircularDependencyError } from "./errors.ts";

const resolutionChain: string[] = [];

export function createProxy<T extends object>(
  target: Constructor<T>,
  tempInstance: any,
  depsPromise: Promise<any[]>,
): Promise<T> {
  // Note: Now returns Promise<T>
  let resolvedInstance: T | null = null;
  const error: Error | null = null;

  // First, create and resolve the actual instance
  const instancePromise = (async () => {
    if (error) throw error;
    if (!resolvedInstance) {
      if (resolutionChain.includes(target.name)) {
        const index = resolutionChain.indexOf(target.name);
        const circle = [...resolutionChain.slice(index), target.name];
        throw new CircularDependencyError(circle);
      }

      resolutionChain.push(target.name);

      try {
        const deps = await Promise.race([
          depsPromise,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new DIError("Dependency resolution timeout")),
              5000,
            ),
          ),
        ]);

        if (!Array.isArray(deps)) {
          throw new DIError("Dependencies resolved to non-array", { deps });
        }

        resolvedInstance = new target(...deps);
        Object.assign(resolvedInstance, tempInstance);
        return resolvedInstance;
      } finally {
        resolutionChain.pop();
      }
    }
    return resolvedInstance;
  })();

  return instancePromise;
}
