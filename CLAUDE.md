# CLAUDE.md — Engineering Standards

## Prime directive
Write every line for the **next human who reads it**, not just for the machine that runs it.
When forced to choose between clever and clear, choose clear. When forced to choose
between short and readable, choose readable. Optimize for how fast a new developer can
understand this code six months from now with zero context.

---

## Before you write code
- **Read the surrounding code first.** Match the existing style, naming, and structure
  of this project. Consistency with what's already here beats your personal preference.
- **Ask if the task is ambiguous** rather than guessing at architecture. A wrong
  abstraction is more expensive to undo than a clarifying question.
- **Keep diffs minimal and focused.** Change only what the task needs. Do not reorganize
  files, rename things, or "clean up" unrelated code unless explicitly asked — surprise
  refactors make reviews painful.

---

## Naming
- Names must reveal intent. `daysUntilExpiry` not `d`, `fetchActiveUsers()` not `getData()`.
- Booleans read as yes/no questions: `isLoading`, `hasPermission`, `canSubmit`.
- Functions are verbs (`calculateTotal`), variables and classes are nouns (`invoiceTotal`, `PaymentService`).
- No abbreviations that aren't already universal in this codebase. `config` is fine; `usrMgr` is not.
- If a name needs a comment to explain what it is, rename it instead.

## Functions
- One function does one thing. If you describe it with "and", it should be two functions.
- Keep functions short enough to read on one screen without scrolling (aim ~5–25 lines).
- Prefer few parameters. If a function needs 4+ arguments, pass an object/struct instead.
- Return early to avoid deep nesting. Guard clauses at the top beat nested `if/else` pyramids.
- No hidden side effects — a function named `getUser` should not also write to a database.

## Files
- One clear responsibility per file. When a file starts doing several unrelated things, split it.
- Keep files reasonably sized (roughly under ~300 lines as a soft ceiling). A giant file is a
  signal to break things apart, not to keep scrolling.
- Order within a file top-down: public/exported things first, private helpers below, so a
  reader meets the "what" before the "how".

## Comments
- Comment the **why**, not the **what**. The code already shows what it does; explain the
  reasoning, the trade-off, or the non-obvious constraint.
- Delete commented-out code. Version control is the history; dead code is just noise.
- No redundant comments (`i++ // increment i`). If code needs a comment to be understood,
  first try to make the code itself clearer.
- Leave a `// NOTE:` or `// TODO:` with context when you knowingly cut a corner.

## Structure & abstraction
- **Don't abstract early.** Duplicate twice before extracting a shared helper — premature
  "DRY" creates the wrong abstraction, which is worse than a little repetition.
- Handle errors explicitly and close to where they happen. No silent `catch {}` that
  swallows failures.
- No magic numbers or strings — pull them into named constants.
- Keep business logic separate from UI, I/O, and framework glue so each can be read alone.

---

## Folder organization
Organize **by feature, not by file type.** A newcomer should be able to look at the folder
tree and understand what the app *does*, not just what layers it has.

Prefer this (feature-first, colocated):
```
src/
  features/
    auth/
      data/          # repositories, API clients, models for this feature
      logic/         # state / controllers / services
      ui/            # screens, views, or components for this feature
    payments/
      data/
      logic/
      ui/
  core/              # shared, cross-feature building blocks
    theme/
    utils/
    components/      # truly reusable, feature-agnostic UI
    errors/
  entrypoint         # main / index / app bootstrap
```

Over this (layer-first — everything smeared across the tree):
```
src/
  models/     # every model from every feature dumped together
  views/
  services/
  components/
```

Rules:
- Anything used by **one** feature lives inside that feature. Only promote to `core/`
  when it's genuinely shared by two or more.
- Folder and file names are lowercase, descriptive, and consistent with whatever casing
  convention the project already uses.
- Keep nesting shallow. If you're four folders deep to find a file, the structure is wrong.

---

## Consistency with the language & project
- Follow the idioms, naming conventions, and formatting standard for whatever language
  this project uses — match the existing code over any generic preference.
- Keep framework glue (UI, routing, DI, I/O) thin and separated from core logic so each
  layer can be read and tested on its own.
- Use the project's existing formatter and linter; run them and fix warnings before
  considering a change done. Don't introduce new conventions unasked.

---

## Definition of done
Before you say a change is finished:
1. It reads clearly to someone who's never seen it.
2. Naming, structure, and formatting match the rest of the project.
3. The formatter and linter pass with no new warnings.
4. The diff is minimal — nothing unrelated was touched.
5. Anything non-obvious has a short "why" comment.
