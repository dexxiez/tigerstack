import { Constructor } from "../internals/index.ts";
import { TEMP_INSTANCE } from "./symbols.ts";
import { InjectableMetadata, DependencyToken } from "./types.ts";
import { setMetadata, getMetadata } from "./metadata.ts";

export class TestTools {
  /**
   * Creates a properly injectable mock that maintains DI metadata
   */
  static createMockInjectable<T>(
    name: string,
    implementation: Partial<T> = {},
    dependencies: DependencyToken<any>[] = [],
  ): Constructor<T> {
    // Create base mock class
    const MockClass = class {
      constructor(..._deps: any[]) {
        Object.assign(this, implementation);
      }
    };

    // Set proper name for debugging
    Object.defineProperty(MockClass, "name", { value: name });

    // Setup injectable metadata
    const metadata: InjectableMetadata = {
      dependencies,
      instance: undefined,
      resolving: false,
      [TEMP_INSTANCE]: undefined,
    };

    setMetadata(MockClass, metadata);

    return MockClass as unknown as Constructor<T>;
  }

  /**
   * Creates a mock that exactly mirrors the DI setup of an existing class
   */
  static mockExistingInjectable<T>(
    originalClass: Constructor<T>,
    implementation: Partial<T> = {},
  ): Constructor<T> {
    const originalMetadata = getMetadata(originalClass);

    const MockClass = this.createMockInjectable<T>(
      `Mock${originalClass.name}`,
      implementation,
      originalMetadata.dependencies || [],
    );

    // Copy over any additional metadata
    const fullMetadata = { ...originalMetadata };
    setMetadata(MockClass, fullMetadata);

    return MockClass;
  }

  /**
   * Creates a factory for generating related mocks
   */
  static createMockFactory<T>(baseImplementation: Partial<T> = {}) {
    return (name: string, extraImplementation: Partial<T> = {}) =>
      this.createMockInjectable<T>(name, {
        ...baseImplementation,
        ...extraImplementation,
      });
  }

  /**
   * Helper to create a basic vi.fn() spy with a default return value
   */
  static async mockFn<T = any, Y extends any[] = any[]>(defaultReturn?: T) {
    const { vi } = await import("vitest");
    return vi.fn<Y, T>().mockImplementation(() => defaultReturn as T);
  }
}
