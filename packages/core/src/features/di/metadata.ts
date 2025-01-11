import { InjectableMetadata } from "./types.ts";
import { INJECTABLE_METADATA } from "./symbols.ts";
import { Constructor } from "../internals/index.ts";

export function getMetadata(target: Constructor<any>): InjectableMetadata {
  return (target as any)[INJECTABLE_METADATA] ?? {};
}

export function setMetadata(
  target: Constructor<any>,
  metadata: InjectableMetadata,
) {
  Object.defineProperty(target, INJECTABLE_METADATA, {
    value: metadata,
    writable: true,
    configurable: true,
  });
}
