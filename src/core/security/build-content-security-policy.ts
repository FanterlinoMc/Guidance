// A per-request nonce (set by src/middleware.ts) lets 'strict-dynamic' allow Next.js's own
// hydration scripts while still blocking any injected/inline script that doesn't carry it.
export function buildContentSecurityPolicy(nonce: string): string {
  // Next.js's dev-mode Fast Refresh runtime evaluates modules via eval(), so 'unsafe-eval' is
  // needed in development only -- production builds don't use eval and stay fully locked down.
  const scriptSources = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"];
  if (process.env.NODE_ENV === "development") {
    scriptSources.push("'unsafe-eval'");
  }

  return [
    `default-src 'self'`,
    `script-src ${scriptSources.join(" ")}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}
