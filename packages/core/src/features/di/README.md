# @tigertrace/core/di

A simple, lightweight, TypeScript-first dependency injection system with support for circular dependencies and forward references.

## Features

- Class-based dependency injection with TypeScript decorators
- Singleton instance management
- Forward reference support for circular dependencies
- Async constructor support with timeout protection
- Clean error handling for circular dependencies and initialization issues

## Installation

```bash
npm install @tigertrace/core
```

## Basic Usage

The DI system uses decorators to define injectable classes and their dependencies:

```typescript
import { Inject, inject } from "@tigertrace/core/di";

// Define injectable services
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

// Inject dependencies using the @Inject decorator
@Inject(DatabaseService, ConfigService)
class UserService {
  constructor(private db: DatabaseService, private config: ConfigService) {}

  getUser() {
    return "user";
  }
}

// Get an instance with resolved dependencies
const userService = await inject(UserService);
```

## Circular Dependencies

The system supports circular dependencies using forward references:

```typescript
import { Inject, inject, forwardRef } from "@tigertrace/core/di";

@Inject(forwardRef(() => ServiceB))
class ServiceA {
  constructor(public b: ServiceB) {}
}

@Inject(ServiceA)
class ServiceB {
  constructor(public a: ServiceA) {}
}

// Both services can now be instantiated
const serviceA = await inject(ServiceA);
```

## Error Handling

The DI system provides detailed error messages for common issues:

- `CircularDependencyError`: Thrown when an invalid circular dependency is detected
- `DIError`: Base error class for general DI issues
- Initialization timeout errors (default 5s timeout)

## Key Concepts

### Singleton Behavior

By default, all injected services are singletons. The same instance is reused across the application:

```typescript
const instance1 = await inject(UserService);
const instance2 = await inject(UserService);
expect(instance1).toBe(instance2); // true
```

### Async Constructor Support

The system supports async constructors with a 5-second timeout protection:

```typescript
@Inject()
class AsyncService {
  constructor() {
    return new Promise((resolve) => setTimeout(() => resolve(this), 1000));
  }
}
```

### Deep Dependency Chains

The system can handle deep dependency chains efficiently:

```typescript
@Inject(Level1)
class Level2 {
  constructor(public l1: Level1) {}
}

@Inject(Level2)
class Level3 {
  constructor(public l2: Level2) {}
}

// All dependencies are resolved correctly
const level3 = await inject(Level3);
```

## Best Practices

1. Use forward references when dealing with circular dependencies
2. Keep constructor logic synchronous when possible
3. Handle async initialization in separate methods rather than constructors
4. Use TypeScript for better type safety and IDE support
5. Avoid deeply nested dependency chains when possible

## Limitations

- Decorators must be enabled in your TypeScript configuration
- All dependencies must be classes (no primitive injection)
- Async constructors must resolve within 5 seconds
- Property injection is not supported (constructor injection only)

## Error Examples

### Invalid Circular Dependency

```typescript
@Inject(ServiceB)
class ServiceA {
  constructor(public b: ServiceB) {}
}

@Inject(ServiceA)
class ServiceB {
  constructor(public a: ServiceA) {}
}

// This will throw CircularDependencyError
await inject(ServiceA); // Error: Circular dependency detected: ServiceA -> ServiceB -> ServiceA
```

### Initialization Timeout

```typescript
@Inject()
class SlowService {
  constructor() {
    return new Promise(
      (resolve) => setTimeout(() => resolve(this), 6000), // > 5s timeout
    );
  }
}

// This will throw DIError
await inject(SlowService); // Error: Initialization timeout for SlowService
```
