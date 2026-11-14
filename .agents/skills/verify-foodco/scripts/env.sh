# Sourced by the other scripts. All paths and ports for one verification instance.
ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
SKILL="$ROOT/.agents/skills/verify-foodco"
RUN="${FOODCO_VERIFY_RUN:-/tmp/foodco-verify}"
EVIDENCE="${FOODCO_VERIFY_EVIDENCE:-/tmp/foodco-verify-evidence}"
PG_PORT="${FOODCO_PG_PORT:-55432}"
APP_PORT="${FOODCO_APP_PORT:-3100}"
PG_BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)"
BASE_URL="http://localhost:$APP_PORT"

# Cloudflare's published Turnstile test secret: siteverify always passes for the dummy token.
# Every other third-party value is a placeholder, so Resend, Stripe, OAuth and Sentry calls fail on purpose.
export NODE_ENV=development PORT="$APP_PORT" LOG_LEVEL=info \
  BETTER_AUTH_SECRET=verify-only-secret-0123456789abcdef \
  BETTER_AUTH_URL="$BASE_URL" ALLOWED_ORIGINS="$BASE_URL" \
  GOOGLE_CLIENT_ID=verify GOOGLE_CLIENT_SECRET=verify GITHUB_CLIENT_ID=verify GITHUB_CLIENT_SECRET=verify \
  EMAIL_VERIFICATION_CALLBACK_URL="$BASE_URL/email-verified" \
  RESEND_API=re_verify_placeholder RESEND_FROM_EMAIL=verify@example.com \
  TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA \
  PG_USER=foodco PG_PASSWORD=verify PG_DATABASE=foodco PG_PORT="$PG_PORT" \
  STRIPE_SECRET_KEY=sk_test_placeholder STRIPE_DOMAIN="$BASE_URL" \
  STRIPE_WEBHOOK_SECRET=whsec_placeholder STRIPE_WEBHOOK_ENDPOINT_SECRET=whsec_placeholder
unset SENTRY_DSN SENTRY_DNS  # empty string fails the schema; unset falls back to the default
