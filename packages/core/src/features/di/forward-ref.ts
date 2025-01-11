import { ForwardRef } from "./types.ts";
import { Constructor } from "../internals/index.ts";

export const forwardRef = <T>(fn: () => Constructor<T>): ForwardRef<T> => fn;
