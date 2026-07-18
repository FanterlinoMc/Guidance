const WINDOW_MS = 60 * 60 * 1000;
const PER_IP_LIMIT = 30;
const GLOBAL_LIMIT = Number(process.env.RATE_LIMIT_GLOBAL_PER_HOUR ?? 2000);

interface Bucket {
  count: number;
  windowStart: number;
}

// In-memory: fine for a single long-lived Node process (local dev, Node runtime on
// one instance). On multi-instance/edge deployment this resets per instance and
// won't hold the limit across replicas — swap for Upstash Redis before that matters.
const perIpBuckets = new Map<string, Bucket>();
const globalBucket: Bucket = { count: 0, windowStart: Date.now() };

function rollWindow(bucket: Bucket, now: number): void {
  if (now - bucket.windowStart >= WINDOW_MS) {
    bucket.count = 0;
    bucket.windowStart = now;
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  rollWindow(globalBucket, now);
  const ipBucket = perIpBuckets.get(ip) ?? { count: 0, windowStart: now };
  rollWindow(ipBucket, now);

  const retryAfterSeconds = Math.ceil((ipBucket.windowStart + WINDOW_MS - now) / 1000);

  if (globalBucket.count >= GLOBAL_LIMIT || ipBucket.count >= PER_IP_LIMIT) {
    return { allowed: false, retryAfterSeconds };
  }

  globalBucket.count += 1;
  ipBucket.count += 1;
  perIpBuckets.set(ip, ipBucket);

  return { allowed: true, retryAfterSeconds: 0 };
}
