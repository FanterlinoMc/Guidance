export type AppErrorCode =
  | "RATE_LIMITED"
  | "GUARDRAIL_BLOCKED"
  | "UPSTREAM_UNAVAILABLE"
  | "INVALID_REQUEST"
  | "RETRIEVAL_ABUSE_BLOCKED";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}
