import { AppError } from "@/core/errors/app-error";
import { checkRateLimit } from "./logic/limiter";

function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

export function enforceRateLimit(request: Request): void {
  const { allowed, retryAfterSeconds } = checkRateLimit(clientIp(request));
  if (!allowed) {
    throw new AppError(
      "RATE_LIMITED",
      `Rate limit exceeded. Retry after ${retryAfterSeconds}s.`,
      429,
    );
  }
}
