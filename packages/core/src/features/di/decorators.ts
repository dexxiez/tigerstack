import { DependencyToken } from "./types.ts";
import { setMetadata } from "./metadata.ts";
import { Constructor } from "../internals/index.ts";

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
