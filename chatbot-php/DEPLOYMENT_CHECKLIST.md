# Deployment Checklist — Guidance Chatbot (PHP/Laravel)

Phase 6 of the rewrite. A real staging deploy (Railway, `chatbot-php-production.up.railway.app`,
real MySQL, PHP 8.5) exercised most of this end-to-end — those items are marked verified with
what was actually confirmed. The real Guidance Home Service Site host is still untouched; items
without that marker are still real steps, not formalities.

## 1. Host environment

- [ ] **Confirm the host's actual PHP version.** `composer.json` targets `"php": "^7.3|^8.0"`, and
      the app's own code is still written 7.3-syntax-safe throughout (no constructor promotion,
      readonly, arrow functions, named arguments, str_contains) — but **no tool available this
      session could actually provision real PHP 7.3 to verify it**: not winget (dropped from
      feeds, EOL), not Railway/Railpack (whose docs say "only PHP 8.2 and above are supported").
      The staging deploy ran on PHP 8.5 instead (Railpack's default for an unconstrained-above
      range) — Laravel 8.83 built and ran cleanly on it with no errors surfaced in this pass, which
      is *reassuring* but not the same as confirming the 7.3 floor. If the real host is genuinely
      7.2/7.3, that specific version is still unverified.
- [x] **Confirm required PHP extensions.** Verified via the Railway build: `openssl`, `curl`,
      `mbstring`, `fileinfo`, `tokenizer`, `pdo_mysql` all present and working with zero manual
      config on Railpack's PHP image (unlike the local Windows PHP install, which needed all of
      these enabled by hand in php.ini).
- [x] **Composer availability.** Verified — Railpack detected the Laravel app via `composer.json`
      and ran `composer install` automatically as part of its build.
- [x] **HTTPS.** Verified working on Railway's platform domain. One real bug found and fixed here:
      `app/Http/Middleware/TrustProxies.php` had `$proxies = null` (the Laravel default), so the
      app never saw `X-Forwarded-Proto` and generated `http://` asset URLs on an `https://` page
      even though the actual connection was secure. Fixed by setting `$proxies = '*'` — safe and
      standard for an app that's only ever reached through a host platform's edge proxy, never
      directly exposed. **This fix is real and platform-agnostic — it'll matter on the real host
      too if it sits behind any reverse proxy/load balancer**, which most PHP hosting does.

## 2. Database

- [x] **DB engine.** Verified against real MySQL on staging (matching the most likely real-host
      fit) — all 10 migrations (5 from Phase 3, `role` column from Phase 5, plus Laravel's 4
      defaults) applied cleanly with zero dialect issues, confirming Laravel's schema builder
      abstraction actually holds. **SQLite remains local-dev-only.**
- [x] **DB env vars.** Verified via Railway's variable-reference syntax
      (`${{MySQL.MYSQLHOST}}` etc., resolved at deploy time) — confirms the earlier Phase-3 bug
      (a relative `DB_DATABASE` path resolving against the wrong working directory) was specific
      to the local dev setup, not a design flaw; a real host's DB config just needs real values,
      not a path.
- [x] **Migrations.** Verified — ran cleanly against real MySQL. One surprise: Railpack's Laravel
      build convention runs `php artisan migrate` automatically as part of deploy — don't assume
      you need to trigger it manually on every PaaS, check first.
- [x] **Dashboard user creation.** Verified the `php artisan tinker` direct-insert path works on a
      real deployed instance (`railway ssh` into the container). Still no registration/invite UI —
      that gap is real, just now confirmed to have a working manual workaround on real infra.

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
      empty and the assistant will have no grounded context to answer from. **Confirmed on
      staging**: not uploaded there (deliberately, to keep the deploy fast), so staging's retrieval
      is empty — matches the documented fail-soft behavior exactly, not a surprise failure.
- [ ] Generate or copy these two JSON files onto the host at `storage/app/corpus/`. They're
      produced by the Node scripts kept from the original codebase
      (`scripts/scrape.js`/`chunk.js`/`ingest-internal-docs.js` — Node is needed only to run these
      once, not as an app runtime dependency). Re-run them if the source content has changed since
      this repo's last copy.

## 5. Application setup

- [x] **`composer install`.** Verified — Railpack's build ran this automatically on detecting
      `composer.json`. (Its default is a full install, not `--no-dev`; a real host's deploy
      pipeline should still explicitly use `--no-dev --optimize-autoloader` for production.)
- [x] **Artisan caching.** Verified — `config:cache`/`route:cache`/`view:cache`/`event:cache` all
      ran cleanly as part of Railpack's build with no errors.
- [x] **Writable `storage/`/`bootstrap/cache/`.** Verified — Railpack's build runs
      `chmod -R a+rw storage` automatically; a manually-configured host needs this set explicitly.
- [ ] Web server document root is `public/`, with all non-file requests rewritten to
      `public/index.php` (the committed `public/.htaccess` covers this for Apache; Nginx needs
      the equivalent `try_files` rule in its own config, not included in this repo). Railway's
      Railpack build handles this itself (runs its own PHP server, not Apache/Nginx), so this
      specific item is still unverified against a traditional Apache/Nginx host.

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
      whole point of the frozen wire contract from Phase 0. **Not done on staging** — no
      `ANTHROPIC_API_KEY` was provided for that pass, so live-chat-reply behavior stays unverified
      on real infra specifically (everything not requiring a Claude reply — guardrails, 503
      fallback, lead capture, dashboard, login — was verified there via curl, see below).
- [x] **Golden path (partial).** Verified via curl against real staging infra
      (`chatbot-php-production.up.railway.app`): the PII guardrail correctly blocks and redirects,
      a normal message correctly 503s without an API key (not a crash), and submitting an email
      in-chat correctly created a lead (`track=homebuyer`, `stage=captured`) that showed up on
      `/dashboard/leads` — all matching local-test behavior exactly, now confirmed on a real public
      URL with a real MySQL database. **Not done**: an actual real (non-503) reply, and a real
      browser pass (no Chrome extension connected this session) — layout, click-through, and the
      jQuery widget's actual in-browser behavior are still unverified anywhere but Node-script
      unit tests.
- [x] **Dashboard login cycle.** Verified on staging: created a user via `railway ssh` +
      `php artisan tinker`, logged in over curl with a real CSRF token, all 4 dashboard pages
      (Overview, Leads, Agents, Activity) returned 200 with real data, no embedded PHP errors.

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
- **Real streaming was deliberately not implemented.** The output guardrail needs the complete
  reply before anything ships to the visitor; the buffered/re-chunked delivery is a design
  constraint carried from the original app, not a shortcut to fix later.
- **PHP 7.3 itself remains unverified.** `lead-routing`'s `HandleSlaBreach`/`RecordRoutingOverride`
  were ported and wired into real dashboard actions after this checklist was first written (SLA-
  breach detection on the leads page, an agent-veto override action) — that gap is closed. What's
  still open: no tool available this session (local package managers, Railway/Railpack) could
  actually provision real PHP 7.3 to test against, only 8.1 (local) and 8.5 (staging). See §1.

## 9. Rollback safety

- [ ] Keep the Next.js prototype live until this rewrite is validated in production — the
      `tech-requirements/php-laravel-stack` branch's README already frames it as the reference
      implementation for exactly this reason.
- [ ] Point a staging subdomain at the PHP app first; don't cut the host site's live embed over
      until §7's verification passes for real.
