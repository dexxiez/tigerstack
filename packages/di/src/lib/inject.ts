import { Constructor, ForwardRef } from "./types.ts";
import { getMetadata, setMetadata } from "./metadata.ts";
import { createProxy } from "./proxy.ts";
import { TEMP_INSTANCE } from "./symbols.ts";

export async function inject<T extends object>(
  target: Constructor<T>,
): Promise<T> {
  const metadata = getMetadata(target);

  // If we have a fully resolved instance, return it
  if (metadata.instance && !metadata[TEMP_INSTANCE]) {
    return metadata.instance;
  }

  // If we're already resolving and have a temp instance, return it
  if (metadata.resolving && metadata[TEMP_INSTANCE]) {
    return metadata[TEMP_INSTANCE];
  }

  // Create temp instance right away to handle circular deps
  const tempInstance = {};
  const proxy = await createProxy(target, tempInstance, Promise.resolve([]));

  // Update metadata with temp instance
  metadata.resolving = true;
  metadata[TEMP_INSTANCE] = proxy;
  metadata.instance = proxy; // Important: set instance to proxy right away
  setMetadata(target, metadata);

  try {
    // Resolve all dependencies
    const deps = await Promise.all(
      (metadata.dependencies ?? []).map(async (dep) => {
        const actualDep =
          typeof dep === "function" && !dep.prototype
            ? (dep as ForwardRef<any>)()
            : (dep as Constructor<any>);
        return inject(actualDep);
      }),
    );

    // Create the actual instance
    const realInstance = new target(...deps);

    // Copy any properties from temp instance to real instance
    Object.assign(realInstance, tempInstance);

    // Update proxy target to real instance
    Object.assign(proxy, realInstance);

    // Clean up metadata
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
