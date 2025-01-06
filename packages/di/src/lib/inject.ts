import { Constructor, ForwardRef } from "./types.ts";
import { getMetadata, setMetadata } from "./metadata.ts";
import { createProxy } from "./proxy.ts";
import { TEMP_INSTANCE } from "./symbols.ts";

export async function inject<T extends object>(
  target: Constructor<T>,
): Promise<T> {
  const metadata = getMetadata(target);

  if (metadata.instance && !metadata[TEMP_INSTANCE]) {
    return metadata.instance;
  }

  if (metadata.resolving && metadata[TEMP_INSTANCE]) {
    return metadata[TEMP_INSTANCE];
  }

  metadata.resolving = true;

  try {
    const tempInstance = {};
    metadata[TEMP_INSTANCE] = tempInstance;

    const depsPromise = Promise.all(
      (metadata.dependencies ?? []).map(async (dep) => {
        const actualDep =
          typeof dep === "function" && !dep.prototype
            ? (dep as ForwardRef<any>)()
            : (dep as Constructor<any>);

        return inject(actualDep);
      }),
    );

    const instance = await createProxy(target, tempInstance, depsPromise);
    metadata.instance = instance;
    setMetadata(target, metadata);

    return instance;
  } finally {
    metadata.resolving = false;
  }
}
