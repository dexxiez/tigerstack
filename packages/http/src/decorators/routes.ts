import "reflect-metadata";
import { ClassDecorator, Constructor } from "@tigerstack/core/internals";
import { MetadataManager } from "@tigerstack/core/internals";

type ControllerPrototype = {
  __routePath: string;
  __type: string;
};

const Controller = (path: string): ClassDecorator => {
  return <T extends Constructor<ControllerPrototype>>(target: T): T | void => {
    MetadataManager.setPrototypeProperty<any>(target, "__routePath", path);
    MetadataManager.setPrototypeProperty<any>(target, "__type", "controller");
    return target;
  };
};

export { Controller };
export type { ControllerPrototype };
