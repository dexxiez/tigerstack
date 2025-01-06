import { DIError } from "./errors.ts";
import { Constructor } from "./types.ts";

const instanceMap = new WeakMap<Constructor<any>, any>();

const TIMEOUT = 5000; // 5 second timeout for async initialization

export async function createProxy<T extends object>(
  target: Constructor<T>,
  tempInstance: Record<string | symbol, any>,
  depsPromise: Promise<any[]>,
): Promise<T> {
  // Return existing proxy if we have one
  const existingProxy = instanceMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  let resolvedInstance: T | undefined;

  // Create prototype-preserving proxy
  const proxy = new Proxy(Object.create(target.prototype), {
    get(_, prop: string | symbol) {
      if (prop === Symbol.hasInstance) {
        return (instance: any) => instance instanceof target;
      }

      return resolvedInstance
        ? Reflect.get(resolvedInstance, prop)
        : Reflect.get(tempInstance, prop);
    },
    set(_, prop: string | symbol, value: any) {
      if (resolvedInstance) {
        return Reflect.set(resolvedInstance, prop, value);
      }
      return Reflect.set(tempInstance, prop, value);
    },
    getPrototypeOf() {
      return target.prototype;
    },
  });

  // Store proxy right away
  instanceMap.set(target, proxy);

  try {
    const deps = await depsPromise;

    // Create instance with timeout for async constructors
    const instancePromise = Promise.resolve().then(async () => {
      const instance = new target(...deps);

      // If constructor returns a promise, wait for it
      if (instance instanceof Promise) {
        return await instance;
      }

      return instance;
    });

    // Race against timeout
    resolvedInstance = await Promise.race([
      instancePromise,
      new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new DIError(`Initialization timeout for ${target.name}`)),
          TIMEOUT,
        ),
      ),
    ]);

    // Copy temp properties to resolved instance
    for (const [key, value] of Object.entries(tempInstance)) {
      if (!(key in resolvedInstance)) {
        (resolvedInstance as any)[key] = value;
      }
    }

    return proxy as T;
  } catch (err) {
    instanceMap.delete(target);
    if (err instanceof Error) {
      throw new DIError(`Failed to instantiate ${target.name}: ${err.message}`);
    }
    throw err;
  }
}
