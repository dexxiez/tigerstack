/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import { Constructor } from "./types.ts";
import "reflect-metadata";

type MetadataValue = string | number | boolean | object;

// Helper class for managing decorator metadata
export class MetadataManager {
  // For handling prototype properties
  static setPrototypeProperty<T extends object>(
    target: Constructor<T>,
    key: string,
    value: any,
  ): void {
    Object.defineProperty(target.prototype, key, {
      value,
      writable: true,
      enumerable: false, // Makes it hidden from Object.keys()
      configurable: true,
    });
  }

  // For handling metadata
  static setMetadata(
    key: string,
    value: MetadataValue,
    target: Object,
    propertyKey?: string,
  ): void {
    if (propertyKey) {
      Reflect.defineMetadata(key, value, target, propertyKey);
    } else {
      Reflect.defineMetadata(key, value, target);
    }
  }

  static getMetadata<T = any>(
    key: string,
    target: Object,
    propertyKey?: string,
  ): T {
    const metadata = propertyKey
      ? Reflect.getMetadata(key, target, propertyKey)
      : Reflect.getMetadata(key, target);
    return metadata ?? ({} as T);
  }

  // Merge new metadata with existing
  static mergeMetadata<T extends object>(
    key: string,
    value: Partial<T>,
    target: Object,
    propertyKey?: string,
  ): void {
    const existing = this.getMetadata<T>(key, target, propertyKey) || ({} as T);
    this.setMetadata(key, { ...existing, ...value }, target, propertyKey);
  }

  static isBlankObject(obj: object): Boolean {
    return Object.keys(obj).length === 0;
  }
}
