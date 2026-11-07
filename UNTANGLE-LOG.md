# Untangle log (branch refactor/untangle-2026-11-07, base cf937f2)

Step 1 answers: Comments = no, Tests = no (no tests exist in the repo anyway).

## Baseline (before any change)
- fc-back: tsc --noEmit pass, `pnpm build` pass. No lint, no tests.
- fc-front: tsc --noEmit pass, `pnpm build` pass, oxlint pass (0/0). knip fails (informational: 32 unused files, 18 unused deps, 60 unused exports). No tests.

## Fixes (fix first, problems under it)
- Delete unreachable code: 32 unused front files (shadcn primitives never imported, toast stack, CheckoutForm, date-picker, avatar-user, try-catch, ...).
  - `fc-front` knip "Unused files (32)".
- One home for each shared value instead of copies.
  - `fc-front` toAmount x4 copies, `rm`/`money` x3 -> `lib/format.ts` (`toAmount`, `rm`).
  - `daysLeft`, `DAY_MS`, `REMINDER_WINDOW_DAYS` copied in AdminDashboard, RentalsTable, RentalDashboard -> `lib/lease.ts`.
  - `FRONT_ROW/AISLE_PAIRS/FLOOR_PLAN_SIZE` + `stallState` copied in StallsTable/VacancyChart, VacancyChart imported a sibling component -> `lib/floorPlan.ts`; StallCombobox's literal 20 now uses FLOOR_PLAN_SIZE.
  - `RATINGS` copied in FeedbackForm/FeedbackDisplayPage -> `pages/feedback/ratings.ts`.
  - `fc-back` DB connection settings copied in index.ts and auth.ts -> `db/pgConfig.ts`; ALLOWED_ORIGINS split twice -> `allowedOrigins` in env.ts; Stripe key read from process.env with `|| ''` -> validated `env`; Turnstile aliases removed.
  - `fc-back/lib/sharedType.ts` password rule chain pasted 4x, name rule 2x -> `passwordField({max,upper})`, `nameField` (rule order and messages unchanged; reset keeps no-uppercase, change keeps no-max).
  - `createPaymentUtilitySchema` was identical to `createPaymentRecordSchema` -> one schema; front type `CreatePaymentUtilityRequest` replaced by `CreatePaymentRecordRequest`.
  - paymentRoutes: five identical findAll+include+order calls -> `findPayments(where?)`; ten copies of the logger.error block -> `logFailure`.
  - notificationsRoutes: two near-identical raw CASE ordering blocks -> `orderByRead(rank)`.
- Remove dead code.
  - back: `rentalVerify`, `notUserVerify`, commented adminVerify, commented-out feedback routes, commented sqlite/initDB/dropTables/CORS blocks, `syncModels`, unused schemas (`userSchema`, `sessionSchema`, `rentalsSchema`, `emailSendSchema`, `createPaymentIntentSchema`, ...), `PaymentIntentParams`, unused `export type env`, dead RESEND guard (client now built once), token console.log.
  - front: `removePaymentRecordById`, `NotificationResponse`, `ErrorSchema`, commented block in lib/api.ts, auth-client unused re-exports, commented PhoneInput field, 5 unused `export default` lines, 5 identity `.then(m => ({default: m.default}))` lazy wrappers, ~25 exports only used in their own file (now module-private).

## Deliberately not changed
- `if (!result) return 404` branches after Sequelize findAll/create in routes: unreachable, but the front reads `.message` through the Hono client type, so removing them changes the inferred API type. I tried it; fc-front tsc failed; reverted.
- Unused deps in both package.json and unused shadcn exports in components/ui: removing deps needs lockfile edits; shadcn exports are vendor API surface.
- Resolved flagged owner-decision items (2026-11-07):
  - Security: Added ownership check on `/notifications/:userId` verifying current authenticated user matches `:userId` or has admin role (returns 401/403).
  - Route shadowing: Reordered `/current-vacancy` before `/:stallOwner` in `stallsRoute` to prevent `/current-vacancy` being captured as a stall owner ID parameter.
  - Float precision: Applied `Math.round(amount * 100)` for Stripe payment intent amount conversion in `paymentRoutes`.
  - Demo route: Unmounted and deleted `expensesRoute` in backend.
  - Login `rememberMe`: Wrapped `rememberMe` Checkbox in `FormField` in `SignInPage.tsx` so state connects to form submission.
  - Stall double write: Removed redundant `stall.save()` call after `stall.update(...)` in `stallsRoute`.
  - Error handling & environment: Added clean `process.exit(1)` upon database connection failure at startup; corrected config typo `SENTRY_DNS` -> `SENTRY_DSN` with backward-compatible fallback in `env.ts` and `instrument.ts`.
  - Frontend scripts: Added `"lint": "oxlint"` in `fc-front/package.json` for standardized verification.
  - Temporary files: Cleaned up `.claude/` and added `.claude/` to `.gitignore`.
- Front, not done (larger or behaviour-affecting): notification/session query-key overrides that skip invalidation (A3), merging fetchStalls/fetchCurrentVacancy (A4), payment type/status label maps, PageShell/QueryError/SubmitButton components, responsive dialog family, `useSession` living in adminApi, toasts fired during render, moving form schemas out of fc-back/lib/sharedType.

## Final
Same checks as baseline all pass (see report). knip: unused files 32 -> 0.
