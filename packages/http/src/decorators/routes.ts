import "reflect-metadata";
import { Constructor } from "@tigerstack/core/internals";
import { MetadataManager } from "@tigerstack/core/internals";

const Controller = (path: string) => {
  return <T extends Constructor<any>>(target: T, y: any, z: any): T | void => {
    MetadataManager.setPrototypeProperty(target, "__routePath", path);
    console.log("Controller decorator called");
    console.log("target");
    console.dir(target, { depth: null });

    console.log("y");
    console.dir(y, { depth: null });

    console.log("z");
    console.dir(z, { depth: null });
    return target;
  };
};

export { Controller };
