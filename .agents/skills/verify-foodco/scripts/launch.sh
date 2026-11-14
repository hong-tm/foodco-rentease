#!/usr/bin/env bash
# Start an isolated Postgres + the built foodco app. Usage: launch.sh [--no-build]
set -euo pipefail
source "$(dirname "$0")/env.sh"

if [ -e "$RUN" ]; then
  echo "refusing: $RUN exists (another instance or a stale run). Run teardown.sh first." >&2; exit 1
fi
[ -n "$PG_BIN" ] || { echo "Postgres binaries not found under /usr/lib/postgresql (apt install postgresql)" >&2; exit 1; }

mkdir -p "$RUN/pg" "$EVIDENCE"
chown -R postgres "$RUN"
runuser -u postgres -- "$PG_BIN/initdb" -D "$RUN/pg" -U foodco --auth=trust >"$RUN/initdb.log"
runuser -u postgres -- "$PG_BIN/pg_ctl" -D "$RUN/pg" -l "$RUN/pg.log" -w \
  -o "-p $PG_PORT -k $RUN -c listen_addresses=localhost" start >/dev/null
runuser -u postgres -- "$PG_BIN/createdb" -h localhost -p "$PG_PORT" -U foodco foodco

if [ "${1:-}" != "--no-build" ]; then
  pnpm -C "$ROOT/fc-front" build >"$RUN/build-front.log" 2>&1
  pnpm -C "$ROOT/fc-back" build >"$RUN/build-back.log" 2>&1
fi

(cd "$ROOT/fc-back" && node --input-type=module <"$SKILL/scripts/seed.mjs")

cd "$ROOT/fc-back"
nohup node dist/index.js >"$RUN/app.log" 2>&1 &
echo $! >"$RUN/app.pid"

for _ in $(seq 1 60); do
  if grep -q "Server is running on" "$RUN/app.log"; then
    "$SKILL/scripts/doctor.sh" && exit 0
  fi
  if ! kill -0 "$(cat "$RUN/app.pid")" 2>/dev/null; then break; fi
  sleep 0.5
done
echo "app did not become ready; tail of $RUN/app.log:" >&2; tail -20 "$RUN/app.log" >&2; exit 1
