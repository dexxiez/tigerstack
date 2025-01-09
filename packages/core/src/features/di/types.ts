import { TEMP_INSTANCE } from "./symbols.ts";

export type Constructor<T> = new (...args: any[]) => T;
export type ForwardRef<T> = () => Constructor<T>;
export type DependencyToken<T> = Constructor<T> | ForwardRef<T>;

export interface InjectableMetadata {
  dependencies?: DependencyToken<any>[];
  instance?: any;
  resolving?: boolean;
  propertyKeys?: string[];
  [TEMP_INSTANCE]?: any;
}

export interface DebugInfo {
  target: string;
  resolutionAttempts: number;
  lastAttempt: Date | null;
  errors: string[];
}
