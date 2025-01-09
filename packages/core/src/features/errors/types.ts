export type ErrorCode = "ERR_MISSING_DEPENDENCY" | (string & {});

export interface RuntimeError extends Error {
  readonly fatal: boolean;
  readonly code: ErrorCode;
  readonly timestamp: Date;
}
