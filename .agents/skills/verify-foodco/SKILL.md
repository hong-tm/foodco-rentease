---
name: verify-foodco
description: Launch FoodCo RentEase (fc-back + built fc-front) against a throwaway Postgres with seed data, sign in as a seeded admin/rental/user, and drive the real UI with Playwright to prove a change works end to end (UI action, API call, database row). Use before claiming any fc-front or fc-back behavior change works, and to reproduce a bug on the real surface.
---

# Verify FoodCo RentEase

Unit checks (tsc, oxlint, knip) cannot see whether a button reaches the API. This skill runs the production bundle the way prod does (`node dist/index.js` serving `fc-back/webpage`), on its own Postgres, and drives it as a user.

All commands run from the repo root. Scripts live in `.agents/skills/verify-foodco/scripts/` (`$S` below). Browser scripts need `NODE_PATH=/usr/local/lib/node_modules` (global Playwright with Chromium).

## Launch

```bash
S=.agents/skills/verify-foodco/scripts
pnpm -C fc-back install && pnpm -C fc-front install   # fresh worktree only
$S/launch.sh            # builds front + back, then starts; --no-build reuses dist/ and webpage/
```

What it does: `initdb` a cluster in `/tmp/foodco-verify/pg` on port 55432 (as the `postgres` OS user), builds, creates the schema from the app's own Sequelize models (`seed.mjs`; main has no migration step), seeds data, starts the app on port 3100, then runs doctor. Ready = doctor prints `doctor: OK`.

Seed data: users `admin@verify.test`, `rental@verify.test`, `user@verify.test` (password `Verify-pass-123`, email verified); tiers Standard/Premium/Corner; stalls 1–8, stall 1 leased to the rental user, 2–8 free; one feedback on stall 1.

Override with env: `FOODCO_VERIFY_RUN` (run dir), `FOODCO_VERIFY_EVIDENCE`, `FOODCO_PG_PORT`, `FOODCO_APP_PORT`. launch.sh refuses to start if the run dir exists: one instance per run dir, never drive one you did not start.

Prerequisite: Postgres server binaries under `/usr/lib/postgresql/*/bin` (`apt install postgresql`; the system service can stay disabled).

## Doctor

```bash
$S/doctor.sh
```

Read-only. Fails unless: our pid is alive and owns the app port, Postgres answers, `GET /api` answers, and `/api/stalls` returns seeded stalls. Prints the git revision under test. Run it whenever anything looks off.

## Drive

Sign-in: `node $S/login.mjs <admin|rental|user>` posts to the real `/api/auth/sign-in/email` and saves a Playwright storageState in the run dir. `drive.mjs` calls it automatically.

```bash
export NODE_PATH=/usr/local/lib/node_modules
node $S/drive.mjs admin /dashboard/stall-availability shot-name   # ARIA snapshot + screenshot + API/console errors
node $S/journey-lease-stall.mjs                                   # full feature journey, exit 0 = PASS
node $S/journey-utility-bill.mjs
```

For a new journey, copy a `journey-*.mjs`: `import { open } from './drive.mjs'`, select by role and accessible name (see the feature files), wait for the specific API response, then read the row back with `psql`.

Database read-back:

```bash
runuser -u postgres -- psql -h localhost -p 55432 -U foodco -d foodco -c 'select * from "Stalls"'
```

Table names are quoted and capitalised (`"Stalls"`, `"Payments"`, `"StallTiers"`, `"Feedbacks"`, `"Notifications"`, `"Utilities"`); auth tables are `"user"`, `account`, `session`, `verification`.

## Evidence

Goes to `/tmp/foodco-verify-evidence/` (timestamped PNGs plus `<journey>.log`). A proof has all three: the UI action, the API response status, and the database row after. A success toast alone is not proof: on cfb5b21 the stall form showed "Stall updated successfully" while sending no request. For a bug fix, run the journey on the base commit first and keep that failing log next to the passing one.

## Cleanup

```bash
$S/teardown.sh
```

Kills the app pid from `app.pid`, stops the Postgres cluster, deletes the run dir. Evidence is kept. `fc-back/dist` and `fc-back/webpage` are gitignored build output and stay.

## What this does not cover

Placeholders in `env.sh` make these fail on purpose: email (Resend), Stripe checkout, Google/GitHub OAuth, Sentry. The UI sign-in form cannot be driven on localhost (see `features/sign-in.md`). Verify those paths elsewhere or add test credentials through `request_secret`, never by pasting keys.

## Feature map

`features/README.md` indexes the user-facing features and how to drive each. Keep it current with `/maintain-verification-skill` when routes or labels change.
