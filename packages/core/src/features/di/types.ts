import { Constructor } from "../internals/index.ts";
import { TEMP_INSTANCE } from "./symbols.ts";

export type ForwardRef<T> = () => Constructor<T>;
export type DependencyToken<T> = Constructor<T> | ForwardRef<T>;

export interface InjectableMetadata {
  dependencies?: DependencyToken<any>[];
  instance?: any;
  resolving?: boolean;
  propertyKeys?: string[];
  [TEMP_INSTANCE]?: any;
}

export interface AsyncInitializable {
  onInit(): Promise<void> | void;
}

export interface DebugInfo {
  target: string;
  resolutionAttempts: number;
  lastAttempt: Date | null;
  errors: string[];
}
