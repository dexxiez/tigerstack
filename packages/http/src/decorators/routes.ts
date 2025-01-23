import "reflect-metadata";
import { ClassDecorator, Constructor } from "@tigerstack/core/internals";
import { MetadataManager } from "@tigerstack/core/internals";
import { DependencyToken, Inject } from "@tigerstack/core/di";

type ControllerPrototype = {
  __routePath: string;
  __type: string;
};

export const Controller = (
  path: string,
  dependencies: DependencyToken<any>[] = [],
): ClassDecorator => {
  return <T extends Constructor<ControllerPrototype>>(target: T): T | void => {
    MetadataManager.setMetadata("routePath", path, target);
    MetadataManager.setMetadata("type", "controller", target);

    // Apply the Inject decorator with dependencies
    return Inject(...dependencies)(target) as T;
  };
};

export const Get =
  (routePath = "/") =>
  (target: any, propertyKey: string) => {
    MetadataManager.setMetadata("httpMethod", "GET", target, propertyKey);
    MetadataManager.setMetadata("routePath", routePath, target, propertyKey);
  };

export const Post =
  (routePath = "/") =>
  (target: any, propertyKey: string) => {
    MetadataManager.setMetadata("httpMethod", "POST", target, propertyKey);
    MetadataManager.setMetadata("routePath", routePath, target, propertyKey);
  };
