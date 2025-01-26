// Types (usually untility types) that are used across packages, not just individual features

export type Constructor<T> = {
  new (...args: any[]): T;
  prototype: T;
} & Function;

export type ClassDecorator = <T extends { new (...args: any[]): any }>(
  constructor: T,
) => T | void;

/**
 * HEHEH GET IT?
 */
export type ClassProtoType<T, P> = T & {
  prototype: P;
};
