#!/usr/bin/env bash
# Read-only: is this instance ours, up, and seeded?
set -uo pipefail
source "$(dirname "$0")/env.sh"
fail() { echo "doctor: FAIL $*" >&2; exit 1; }

[ -f "$RUN/app.pid" ] || fail "no $RUN/app.pid (not launched)"
pid=$(cat "$RUN/app.pid")
kill -0 "$pid" 2>/dev/null || fail "app pid $pid is not running"
owner=$(ss -ltnpH "sport = :$APP_PORT" | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
[ "$owner" = "$pid" ] || fail "port $APP_PORT is owned by pid ${owner:-none}, not our app $pid"
runuser -u postgres -- "$PG_BIN/pg_isready" -q -h localhost -p "$PG_PORT" || fail "postgres not ready on $PG_PORT"
[ "$(curl -s "$BASE_URL/api")" = "API is running!" ] || fail "GET /api did not answer"
stalls=$(curl -s "$BASE_URL/api/stalls" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).stall.length)}catch{console.log(0)}})')
[ "$stalls" -gt 0 ] || fail "no seeded stalls"
echo "doctor: OK  app=$BASE_URL pid=$pid  pg=localhost:$PG_PORT  stalls=$stalls  build=$(git -C "$ROOT" rev-parse --short HEAD)"
