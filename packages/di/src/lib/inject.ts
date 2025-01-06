import { Constructor, ForwardRef, DependencyToken } from "./types.ts";
import { getMetadata, setMetadata } from "./metadata.ts";
import { createProxy } from "./proxy.ts";
import { TEMP_INSTANCE } from "./symbols.ts";
import { CircularDependencyError } from "./errors.ts";

function isForwardRef(dep: DependencyToken<any>): dep is ForwardRef<any> {
  return typeof dep === "function" && !dep.prototype;
}

export async function inject<T extends object>(
  target: Constructor<T>,
  resolutionChain: string[] = [],
  forwardRefs: Set<string> = new Set(),
): Promise<T> {
  const metadata = getMetadata(target);

  if (metadata.instance && !metadata[TEMP_INSTANCE]) {
    return metadata.instance;
  }

  const currentDep = target.name;
  const existingIndex = resolutionChain.indexOf(currentDep);

  if (existingIndex !== -1) {
    const cycle = [...resolutionChain.slice(existingIndex), currentDep];

    // For each pair of dependencies in the cycle, check if there's a forward ref
    let hasValidForwardRefs = true;
    for (let i = 0; i < cycle.length - 1; i++) {
      const current = cycle[i];
      const next = cycle[i + 1];

      // If neither dependency in this pair uses forward refs, the cycle is invalid
      if (!forwardRefs.has(current) && !forwardRefs.has(next)) {
        hasValidForwardRefs = false;
        break;
      }
    }

    if (!hasValidForwardRefs) {
      throw new CircularDependencyError(cycle);
    }

    // Valid cycle with forward refs
    if (metadata[TEMP_INSTANCE] && metadata.resolving) {
      return metadata[TEMP_INSTANCE];
    }
  }

  const currentChain = [...resolutionChain, currentDep];

  // Create temp instance and proxy right away
  const tempInstance = {};
  const proxy = await createProxy(target, tempInstance, Promise.resolve([]));

  try {
    metadata.resolving = true;
    metadata[TEMP_INSTANCE] = proxy;
    metadata.instance = proxy;
    setMetadata(target, metadata);

    // Track dependencies that use forward refs
    const dependencies = metadata.dependencies ?? [];
    dependencies.forEach((dep) => {
      if (isForwardRef(dep)) {
        const actualDep = dep();
        forwardRefs.add(actualDep.name);
      }
    });

    const deps = await Promise.all(
      dependencies.map(async (dep) => {
        const actualDep = isForwardRef(dep) ? dep() : dep;
        return inject(actualDep, currentChain, forwardRefs);
      }),
    );

    const realInstance = new target(...deps);
    Object.assign(realInstance, tempInstance);
    Object.assign(proxy, realInstance);

    metadata.resolving = false;
    metadata[TEMP_INSTANCE] = undefined;
    metadata.instance = proxy;
    setMetadata(target, metadata);

    return proxy;
  } catch (err) {
    metadata.resolving = false;
    metadata[TEMP_INSTANCE] = undefined;
    setMetadata(target, metadata);
    throw err;
  }
}
