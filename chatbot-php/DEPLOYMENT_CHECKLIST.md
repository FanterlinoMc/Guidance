# Deployment Checklist — Guidance Chatbot (PHP/Laravel)

Phase 6 of the rewrite. Everything below is unverified against the real Guidance Home Service
Site host — this app has only ever run against a local PHP 8.1 dev server + SQLite. Treat every
item as a real step, not a formality; several were only found by actually hitting them during
local testing (noted inline where relevant).

## 1. Host environment

- [ ] Confirm the host's actual PHP version. `composer.json` targets `"php": "^7.3|^8.0"` — verify
      the host is at least 7.3.0. If it's genuinely 7.2, the app needs re-verifying against that
      floor (untested at 7.2; this port was built and tested against 7.3-compatible syntax on a
      local PHP 8.1 install, never against real 7.2 or 7.3).
- [ ] Confirm required PHP extensions are enabled on the host: `openssl`, `curl`, `mbstring`,
      `fileinfo`, `tokenizer`, `PDO` + the driver matching the real DB engine (`pdo_mysql` or
      `pdo_pgsql` — **not** `pdo_sqlite`, that's local-dev-only, see §2). All of these needed
      manual enabling in php.ini on the local dev PHP install; don't assume a host has them on by
      default.
- [ ] Confirm Composer is available on the host, or that you're deploying a pre-built `vendor/`
      directory instead (composer.lock is committed, so a matching install is reproducible either
      way).
- [ ] Confirm HTTPS is available/enforced. The session cookie's `SameSite=None; Secure` policy in
      production (`App\Services\Session\SessionResolver`) requires it — same-origin requests work
      under HTTP but cross-origin embedding will silently fail to persist the session cookie
      without HTTPS.

## 2. Database

- [ ] Decide the real DB engine (MySQL is the most likely fit for typical PHP/Laravel shared
      hosting; Postgres also works). **SQLite was local-dev-only** — a zero-setup convenience for
      testing on this machine, never the deployment target. Laravel's schema builder abstracts the
      dialect difference; the migrations don't need rewriting either way.
- [ ] Set real `DB_CONNECTION` / `DB_HOST` / `DB_PORT` / `DB_DATABASE` / `DB_USERNAME` /
      `DB_PASSWORD` in the host's `.env` — do **not** reuse the local `.env`'s
      `DB_DATABASE=D:/Guidance-php-laravel-stack/...` absolute path, that's specific to this
      machine (and was itself a real bug found during Phase 3 — a relative path resolved against
      the wrong working directory and silently broke every DB write into a generic 503; use a
      real host, not a path, for a non-SQLite connection).
- [ ] Run `php artisan migrate --force` against the real DB. Six migrations total: `leads`,
      `stage_events`, `agent_records`, `audit_log`, `session_messages`, and the `role` column added
      to `users` in Phase 5.
- [ ] Create at least one dashboard user with a `role` set. **No registration or invite flow
      exists** — the only way to create a dashboard user today is a direct DB insert or
      `php artisan tinker` (this is how the Phase 5 smoke test did it). Decide whether that's
      acceptable long-term or whether a seeder / admin-invite flow is worth building before this
      ships to real staff.

## 3. Environment variables (`.env`)

| Variable | Local dev value | Production guidance |
|---|---|---|
| `APP_ENV` | `local` | `production` |
| `APP_DEBUG` | `true` | **`false`** — see the callout below, this one is not optional |
| `APP_KEY` | (dev key, committed nowhere) | generate fresh via `php artisan key:generate` on the real deployment, never copy the dev key |
| `ANTHROPIC_API_KEY` | empty | required — chat returns 503 `UPSTREAM_UNAVAILABLE` without it (verified this is the actual failure mode, not a crash) |
| `CLAUDE_MODEL` | `claude-sonnet-5` | confirm still the intended model |
| `ALLOWED_ORIGINS` | empty (default-deny) | set to the real embedding domain(s), comma-separated, if the widget is served cross-origin from wherever this app is deployed |
| `RATE_LIMIT_GLOBAL_PER_HOUR` | `2000` | keep or tune |
| `CACHE_DRIVER` | `file` | **Redis strongly recommended** — the rate limiter and KB-abuse limiter (`RateLimiter`, `KbQueryLimiter`) are both cache-backed by design (a lesson from this rewrite: PHP has no in-process state between requests, unlike the original Node app), and the file cache driver's locking is not built for real concurrent traffic the way Redis is |
| `SESSION_DRIVER` | `file` | Redis or `database` recommended at real scale, for the same reason |

**`APP_DEBUG=false` is not a nice-to-have.** During Phase 5 testing, an unhandled exception's
debug page (Ignition) hung for 60+ seconds and then fatally errored on this dev machine — with
debug mode on, that failure mode is also what a real visitor or dashboard user would hit, and
it would render full file paths and stack traces. Confirm this is `false` before any real traffic
reaches the app.

## 4. Corpus data

- [ ] The TF-IDF retrieval corpus (`storage/app/corpus/guidance-chunks.json` and
      `internal-chunks.json`) is **not in git** — same as the original Next.js app, these are
      gitignored generated artifacts. `CorpusLoader` fails soft (empty corpus, not a crash) if
      they're missing, so the app will boot fine without them — but every retrieval will come back
      empty and the assistant will have no grounded context to answer from.
- [ ] Generate or copy these two JSON files onto the host at `storage/app/corpus/`. They're
      produced by the Node scripts kept from the original codebase
      (`scripts/scrape.js`/`chunk.js`/`ingest-internal-docs.js` — Node is needed only to run these
      once, not as an app runtime dependency). Re-run them if the source content has changed since
      this repo's last copy.

## 5. Application setup

- [ ] `composer install --no-dev --optimize-autoloader` — **not** a bare `composer install`,
      which pulls in dev-only packages (`phpunit`, `fakerphp`, `mockery`, etc.) that don't belong
      in production.
- [ ] `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache` — standard
      Laravel production performance step; skip only if you have a reason to want live config/
      route reloading.
- [ ] Confirm `storage/` and `bootstrap/cache/` are writable by the web server's process user.
- [ ] Web server document root is `public/`, with all non-file requests rewritten to
      `public/index.php` (the committed `public/.htaccess` covers this for Apache; Nginx needs
      the equivalent `try_files` rule in its own config, not included in this repo).

## 6. Widget embed on the host site

- [ ] Add the embed snippet (documented at the top of
      `public/chat-widget/chat-widget.js`) to the actual Guidance Home Service Site pages:
      jQuery 3.2, then the 10 widget JS files in dependency order, then the CSS link. No build
      step required on the host side.
- [ ] If the widget is served from a different domain/subdomain than the host site embedding it,
      set `ALLOWED_ORIGINS` (§3) to that embedding domain — CORS is default-deny, confirmed via a
      live smoke test this session (no header at all when unset, not a permissive fallback).

## 7. Post-deploy verification

- [ ] Re-run the eval suite against the real deployed URL, this time with a real
      `ANTHROPIC_API_KEY` set so the currently-`SKIPPED` cases can actually grade:
      `EVAL_BASE_URL=https://<real-domain> npm run test:domain` (and `test:resilience`) from the
      original Next.js repo — these still work unmodified against the PHP endpoint, that's the
      whole point of the frozen wire contract from Phase 0.
- [ ] Manually walk the golden path in a real browser: open the widget, ask a financing question,
      confirm a real (non-503) reply streams in, submit an email in-chat and confirm a lead shows
      up in `/dashboard/leads`.
- [ ] Log into `/dashboard` with a real provisioned user and click through all four sections
      (Overview, Leads, Agents, Activity) — the local smoke test covered this over curl with
      synthetic data; a real browser pass with real traffic hasn't happened.

## 8. Known gaps — carried forward or newly introduced, not silently fixed

- **Lead track always defaults to `homebuyer`.** No server-side audience detection exists (same
  gap as the original app) — a real real-estate-agent visitor is misclassified until that's
  built. User-confirmed decision from Phase 3, not an oversight.
- **No password reset or user-registration flow.** Matches the original app having no auth at
  all; this port adds login but not full account-lifecycle management.
- **`agent_records` has no live writer.** Same as the original — populated by a process outside
  this codebase, this port only has the model/migration/dashboard view ready for it.
- **No token-based cost cap on Claude usage** — same gap flagged in the original's own
  `EXTERNAL_ACCOUNTS_SETUP.md`, not something this rewrite added or fixed.
- **`lead-routing`'s `HandleSlaBreach`/`RecordRoutingOverride` were never ported** — dashboard/
  ops-action concerns, not blocking for chat or the read-only dashboard views built in Phase 5.
- **Real streaming was deliberately not implemented.** The output guardrail needs the complete
  reply before anything ships to the visitor; the buffered/re-chunked delivery is a design
  constraint carried from the original app, not a shortcut to fix later.

## 9. Rollback safety

- [ ] Keep the Next.js prototype live until this rewrite is validated in production — the
      `tech-requirements/php-laravel-stack` branch's README already frames it as the reference
      implementation for exactly this reason.
- [ ] Point a staging subdomain at the PHP app first; don't cut the host site's live embed over
      until §7's verification passes for real.
