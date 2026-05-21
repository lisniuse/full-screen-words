# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Two separate workspaces; both must run for the app to work.

### Backend (`server/`)
```powershell
cd server
cp .env.example .env          # populate JWT_SECRET (must be ≥16 chars, not a known default), OPENROUTER_API_KEY
npm install
npm run seed                  # one-time: load ../data/*.json into SQLite words table
npm run start:dev             # http://localhost:5321 (watch mode + nestjs-pino pretty logs)
npm run build                 # nest build → dist/
npm run start:prod            # node dist/main (uses JSON logs + rolling file in logs/)
npx tsc --noEmit              # type check only
```

### Frontend (`frontend/`)
```powershell
cd frontend
npm install
npm run dev                   # http://localhost:2022 (Vite proxies /api → :5321)
npm run build                 # tsc -b && vite build
npx tsc --noEmit              # type check only
```

No test suite exists yet. Validation is `npx tsc --noEmit` on either side.

## Architecture

### Critical UX contract (do not break)

The main page is permanently a **full-screen wall of random words** (`pages/WordsPage.tsx`). It must stay chrome-free — no nav bars, sidebars, or fixed headers. **All auxiliary UI** (login/register, profile, badges, check-in, theme toggle, settings) is summoned by pressing **ESC**, which opens `components/EscOverlay.tsx` as a right-side Drawer. The word-detail modal (`components/WordModal.tsx`) is a separate Modal triggered by clicking a word. Adding visible top-level UI to `WordsPage` is a regression.

### Backend module flow

NestJS 10 + TypeORM (better-sqlite3). `app.module.ts` wires:
- **AuthModule** — JWT + bcryptjs. `auth.service.ts` keeps a `dummyHash` so missing-username and wrong-password take the same bcrypt time (timing-attack defense). `JwtStrategy` is registered once and globally usable by any `@UseGuards(JwtAuthGuard)` without re-importing AuthModule.
- **WordsModule** — `WordsService.getWordInfo()` is the hot path. It checks the SQLite cache, then dedupes concurrent OpenRouter requests for the same word via an in-process `Map<word, Promise>`, then `upsert`s the result (insert-or-update). This guards against React StrictMode firing the modal-open effect twice and against multi-process races. `OpenRouterService.fetchWordInfo()` validates `JSON.parse(content).forms` before returning — malformed payloads never enter the DB; if a stale dirty row is read later, `getCachedInfo()` `remove`s it and returns `null` to force a re-fetch.
- **PracticeModule** — `practice.service.ts` owns the EXP / combo loop. `submit()` is **server-authoritative**: the client sends `exampleIndex` (not the expected text); the service reads `forms[formType].examples[exampleIndex].en` from the cached word and uses *that* as the comparison target. Repeat correct answers on the same `(userId, word, formType, expected)` tuple return `isRepeat=true` with `expGained=0`. `markLearned()` writes an idempotent `_view_` marker row that `listRecent` filters out.
- **CheckInModule** — `today` is computed via `Intl.DateTimeFormat('en-CA', { timeZone: DEFAULT_TZ })`. `stats.save + checkIns.save` are wrapped in a `dataSource.transaction(...)`; the `(userId, date)` unique index plus the transaction prevent half-writes.
- **BadgesModule** — `BADGE_SEEDS` in `badges/badge-rules.ts` is the source of truth; `onModuleInit` upserts them. `evaluate(userId, stats)` is called after every successful `submit` or `checkIn` to unlock newly eligible badges.

`common/level.util.ts` is the single source for the level curve (`expRequiredFor(n) = BASE + STEP*(n-1)`) and combo multiplier (`+10% per 5 combo, capped +100%`). Tweaking the economy means editing only this file.

### Cross-cutting backend infrastructure

- **Global JWT validation**: `main.ts.validateConfig()` refuses to start if `JWT_SECRET` is missing, <16 chars, or matches a known template default. `JwtModule.registerAsync` and `JwtStrategy` also throw on missing secret — there is **no fallback**.
- **Throttling**: `ThrottlerGuard` is `APP_GUARD`. Global is 120 req/min; sensitive endpoints have `@Throttle()` overrides (login 10/min, register 5/min, change-password 5/min, words.info 20/min).
- **Logging**: `nestjs-pino` replaces NestJS's default logger via `app.useLogger(app.get(PinoLogger))`. Config lives in `common/logger.config.ts` — dev uses `pino-pretty` + file, prod uses NDJSON stdout + `pino-roll` daily/20MB rotation in `logs/`. `pino-http` auto-logs HTTP with status-based level mapping; `req.headers.authorization` / `cookie` / `password*` fields are redacted. `pino-roll` `symlink: false` on Windows (EPERM without admin).
- **Errors**: `common/all-exceptions.filter.ts` is `APP_FILTER`. 5xx → `error`, 4xx → `warn`. Captures `err.name`, `message`, `stack`, ORM `code`/`detail`, plus `reqId`, `userId`, `method`, `url`. The filter still hands the response back to NestJS, so API behavior is unchanged.

### Frontend architecture

- **State stores** (`src/store/`): `auth.ts` (JWT + profile, with single-flight `refresh()` dedupe and `clearLearnedCache()` on logout) and `theme.ts` (`light | dark`, persisted to localStorage; toggling sets `body.theme-dark` class).
- **API layer**: `src/api/client.ts` is an axios instance with JWT interceptor + global 401 handler. `src/api/index.ts` exports `api.auth / words / practice / checkin / badges` — extend here when adding endpoints. The interceptor only `message.error`s for ≥400 non-401; 401 silently invalidates the local token.
- **Styling**: All custom CSS-in-JS uses `antd-style`'s `createStyles({ token })`. Components that need to branch on dark mode accept `{ isDark }` as the **second** `createStyles` argument and read `isDark` from `useThemeStore` directly — **do not rely on `antd-style`'s `isDarkMode` parameter**; in this project it does not reliably reflect ConfigProvider's algorithm change. `shadcnTheme.ts` provides two full token sets (light/dark, zinc-flavored) plus `theme.darkAlgorithm | defaultAlgorithm`.
- **WordModal subtleties** (`components/WordModal.tsx`):
  - `maskClosable={false}` — only ✕ and ESC close it.
  - Validation is **debounced** at 550 ms after typing stops. Correct answers POST to `/practice/submit` for EXP/combo; wrong answers stay local (no server call, no combo reset).
  - `normalize()` ignores all Unicode punctuation/symbols (`\p{P}\p{S}`) and folds whitespace. The **server's `PracticeService.normalize()` must stay in sync** — both files reference each other in comments.
  - Modal width is dynamic: a hidden `<span>` is mounted to measure the widest of (`expected`, current `input`) in real DOM pixels at the current font scale, then `Math.max(620, Math.min(measured + 160, viewport - 32))`. Don't switch back to `canvas.measureText` — it returns 0/wrong values before fonts load.
  - `Tab` (when modal is open) toggles study/practice mode globally via a `window.addEventListener('keydown')` with `preventDefault + stopPropagation`. `mode` and `fontSize` ('small'|'medium'|'large') persist to localStorage.
- **WordsPage performance**: Words are generated **once** on mount (`POOL_SIZE = 1500`). Resize does not re-generate. Clicks are handled by a single delegated `onClick` on the container that reads `data-word` from the target, avoiding per-span closures. Double-click on empty space re-rolls the pool.

### OpenRouter integration

`OPENROUTER_API_KEY` is required only when looking up uncached words. Cached words (seeded from `data/*.json` or previously fetched) work offline. `HTTP_PROXY` (e.g., `http://127.0.0.1:7890`) is supported for restricted networks. `/api/words/info` is JWT-protected — anonymous users see the full-screen word list but cannot expand a modal.

### Database

SQLite single file at `~/.full-screen-words/data.sqlite` (cross-platform via `os.homedir()`), **NOT tracked in git** — it's user runtime data. On startup `app.module.ts` `mkdirSync`s the parent dir and one-shot migrates any legacy `server/data.sqlite` over (so existing dev users don't lose accounts/practice records). Override path via `DATABASE_PATH` env. `synchronize` is **on for non-prod only** (toggled by `NODE_ENV`); production must go through TypeORM migrations. Complete schema with ER diagram lives in `docs/SCHEMA.md` — refer there before changing entity files. The `practice_records` table contains rows with `formType='_view_'` (modal-open markers); always filter them out when querying history.

### Ports & env

| | port |
| --- | --- |
| Backend | **5321** |
| Frontend | **2022** (Vite proxies `/api` → `5321`) |

Key env (see `server/.env.example` for the full list): `JWT_SECRET` (required, validated), `DEFAULT_TZ` (default `Asia/Shanghai`, drives check-in date math), `LOG_DIR` / `LOG_LEVEL`, `DATABASE_PATH`, `CORS_ORIGIN`.
