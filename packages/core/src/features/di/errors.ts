export class DIError extends Error {
  constructor(
    message: string,
    public readonly context: Record<string, any> = {},
  ) {
    super(message);
    this.name = "DIError";
  }
}

export class CircularDependencyError extends DIError {
  constructor(
    public readonly dependencyChain: string[],
    message = `Circular dependency detected: ${dependencyChain.join(" -> ")}`,
  ) {
    super(message, { dependencyChain });
    this.name = "CircularDependencyError";
  }
}
