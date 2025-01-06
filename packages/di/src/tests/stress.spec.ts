import {
  Inject,
  inject,
  forwardRef,
  DIError,
  CircularDependencyError,
} from "../index.ts";

// Basic test classes
class DatabaseService {
  connect() {
    return "connected";
  }
}

class ConfigService {
  getConfig() {
    return { url: "test" };
  }
}

class UserService {
  constructor(private db: DatabaseService, private config: ConfigService) {}
  getUser() {
    return "user";
  }
}

// Test Suite
describe("Dependency Injection System", () => {
  // Basic injection
  describe("Basic Injection", () => {
    @Inject(DatabaseService, ConfigService)
    class TestService {
      constructor(public db: DatabaseService, public config: ConfigService) {}
    }

    it("should inject dependencies correctly", async () => {
      const instance = await inject(TestService);
      expect(instance.db).toBeInstanceOf(DatabaseService);
      expect(instance.config).toBeInstanceOf(ConfigService);
    });

    it("should reuse instances (singleton behavior)", async () => {
      const instance1 = await inject(TestService);
      const instance2 = await inject(TestService);
      expect(instance1).toStrictEqual(instance2);
    });
  });

  // Forward references
  describe("Forward References", () => {
    @Inject(forwardRef(() => ServiceB))
    class ServiceA {
      constructor(public b: ServiceB) {}
    }

    @Inject(ServiceA)
    class ServiceB {
      constructor(public a: ServiceA) {}
    }

    it("should handle forward references", async () => {
      const instance = await inject(ServiceA);
      expect(instance.b).toBeInstanceOf(ServiceB);
      expect(instance.b.a).toBe(instance);
    });
  });

  // Circular dependencies
  //describe("Circular Dependencies", () => {
  //  @Inject(ServiceY)
  //  class ServiceX {
  //    constructor(public y: ServiceY) {}
  //  }
  //
  //  @Inject(ServiceX)
  //  class ServiceY {
  //    constructor(public x: ServiceX) {}
  //  }
  //
  //  it("should detect circular dependencies", async () => {
  //    await expect(inject(ServiceX)).rejects.toThrow(CircularDependencyError);
  //  });
  //});

  // Deep dependency chain
  describe("Deep Dependencies", () => {
    class Level1 {}

    @Inject(Level1)
    class Level2 {
      constructor(public l1: Level1) {}
    }

    @Inject(Level2)
    class Level3 {
      constructor(public l2: Level2) {}
    }

    @Inject(Level3)
    class Level4 {
      constructor(public l3: Level3) {}
    }

    it("should handle deep dependency chains", async () => {
      const instance = await inject(Level4);
      expect(instance.l3).toBeInstanceOf(Level3);
      expect(instance.l3.l2).toBeInstanceOf(Level2);
      expect(instance.l3.l2.l1).toBeInstanceOf(Level1);
    });
  });

  // Error cases
  describe("Error Handling", () => {
    it("should throw on invalid dependency type", () => {
      expect(() => {
        @Inject({} as any)
        class InvalidService {}
      }).toThrow();
    });

    // Timeout test
    it("should timeout on deadlocked dependencies", async () => {
      @Inject(forwardRef(() => DeadlockedB))
      class DeadlockedA {
        constructor(public b: any) {
          // Simulate long initialization
          return new Promise((resolve) => setTimeout(resolve, 6000)) as any;
        }
      }

      @Inject(DeadlockedA)
      class DeadlockedB {}

      await expect(inject(DeadlockedA)).rejects.toThrow(DIError);
    });
  });

  // Complex dependency graph
  describe("Complex Dependency Graph", () => {
    class Logger {
      log(msg: string) {
        return msg;
      }
    }

    @Inject(Logger)
    class Cache {
      constructor(private logger: Logger) {}
      get(key: string) {
        return key;
      }
    }

    @Inject(Logger, Cache)
    class API {
      constructor(private logger: Logger, private cache: Cache) {}
      request() {
        return "data";
      }
    }

    @Inject(API, Cache, Logger)
    class ComplexService {
      constructor(
        private api: API,
        private cache: Cache,
        private logger: Logger,
      ) {}
    }

    it("should resolve complex dependency graphs correctly", async () => {
      const instance = await inject(ComplexService);
      expect(instance).toBeInstanceOf(ComplexService);

      // Test instance sharing
      const api = await inject(API);
      const cache = await inject(Cache);
      const logger = await inject(Logger);

      expect(api).toBe((instance as any).api);
      expect(cache).toBe((instance as any).cache);
      expect(logger).toBe((instance as any).logger);
    });
  });

  // Stress test with many parallel injections
  describe("Stress Testing", () => {
    it("should handle multiple parallel injections", async () => {
      const promises = Array(100)
        .fill(null)
        .map(() => inject(UserService));
      const instances = await Promise.all(promises);

      // All instances should be the same (singleton behavior)
      const firstInstance = instances[0];
      instances.forEach((instance) => {
        expect(instance).toBe(firstInstance);
      });
    });
  });
});
