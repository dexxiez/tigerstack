# @tigerstack/di

A lightweight dependency injection library for TypeScript with support for circular dependencies and forward references.

## Installation

```bash
npm install @tigerstack/di
```

## Core Concepts

- **Injectable Classes**: Classes that can be automatically instantiated with their dependencies
- **Forward References**: Handle circular dependencies through lazy evaluation
- **Async Support**: Full support for async constructors and initialization

## Basic Usage

```typescript
import { Inject, inject } from "@tigerstack/di";

// Define injectable services
@Inject()
class UserService {
  getUsers() {
    return ["user1", "user2"];
  }
}

@Inject(UserService)
class AuthService {
  constructor(private userService: UserService) {}

  validateUser(id: string) {
    return this.userService.getUsers().includes(id);
  }
}

// Instantiate with automatic dependency injection
const authService = await inject(AuthService);
```

## Handling Circular Dependencies

Use `forwardRef` when services depend on each other:

```typescript
import { Inject, forwardRef } from "@tigerstack/di";

@Inject(forwardRef(() => ServiceB))
class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Inject(ServiceA)
class ServiceB {
  constructor(private serviceA: ServiceA) {}
}
```

## Async Constructor Support

The library supports async constructors with a 5-second timeout:

```typescript
@Inject()
class DatabaseService {
  constructor() {
    return (async () => {
      await this.connect();
      return this;
    })();
  }

  private async connect() {
    // Initialize connection
  }
}
```

## Error Handling

The library provides specific error types:

- `DIError`: Base error class for dependency injection issues
- `CircularDependencyError`: Thrown when invalid circular dependencies are detected

```typescript
try {
  const service = await inject(MyService);
} catch (error) {
  if (error instanceof CircularDependencyError) {
    console.error("Circular dependency detected:", error.dependencyChain);
  }
}
```

## Best Practices

1. Always use `@Inject()` decorator even for services without dependencies
2. Use `forwardRef` only when necessary to break circular dependencies
3. Keep constructor initialization fast, or move heavy operations to separate init methods
4. Handle potential timeout errors for async constructors
5. Use TypeScript's strict mode for better type safety

## API Reference

### Decorators

- `@Inject(...dependencies: DependencyToken<any>[])`

### Functions

- `inject<T>(target: Constructor<T>): Promise<T>`
- `forwardRef<T>(fn: () => Constructor<T>): ForwardRef<T>`

### Types

- `Constructor<T>`
- `ForwardRef<T>`
- `DependencyToken<T>`

### Errors

- `DIError`
- `CircularDependencyError`
