import { Constructor, ForwardRef } from "./types.ts";

export const forwardRef = <T>(fn: () => Constructor<T>): ForwardRef<T> => fn;
