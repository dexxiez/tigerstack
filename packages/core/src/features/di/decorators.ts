import { Constructor, DependencyToken } from "./types.ts";
import { setMetadata } from "./metadata.ts";

export function Inject(...dependencies: DependencyToken<any>[]) {
  return function (target: Constructor<any>) {
    dependencies.forEach((dep) => {
      if (typeof dep !== "function") {
        throw new Error(`Invalid dependency type for ${target.name}`);
      }
    });

    setMetadata(target, { dependencies });
    return target;
  };
}
