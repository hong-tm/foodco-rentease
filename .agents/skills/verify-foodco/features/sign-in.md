# Sign in

Email and password sign-in through better-auth, guarded by Cloudflare Turnstile; Google and GitHub buttons start OAuth.

## Sub-features

- `sign-in-email` email + password with captcha header.
- `sign-in-oauth` Google / GitHub (not verifiable here).

## How to get to it (user POV)

- Open `/`, fill `Email` and `Password`, solve Turnstile, choose `Sign in`.

## Driving it with login.mjs

Preconditions: doctor OK.

- **Sign in.** `node scripts/login.mjs admin`. Prints `login admin@verify.test: OK` and writes `/tmp/foodco-verify/state-admin.json`.
- **Captcha is enforced.** The same POST without `x-captcha-response` returns 400; a wrong password returns 401.
- **Session works.** `drive.mjs admin /dashboard` lands on `/dashboard/admin-dashboard`; `rental` lands on the rental dashboard.

## Gotchas

- The Turnstile site key in `SignInPage.tsx` is bound to the production domain, so the widget never issues a token on localhost and the form cannot be submitted. login.mjs therefore calls the API directly with Cloudflare's dummy token; `TURNSTILE_SECRET_KEY` in env.sh is Cloudflare's always-pass test secret, and the backend still calls the real siteverify (needs internet).
- Seeded users are inserted with `emailVerified: true`; sign-up through the UI would try to send a Resend email and fail.
- better-auth rate-limits `/sign-in/email` to 5 per 10 s.
