#!/usr/bin/env bash
# Stop what launch.sh started and delete the run dir. Evidence in $EVIDENCE is kept.
set -uo pipefail
source "$(dirname "$0")/env.sh"
[ -d "$RUN" ] || { echo "nothing to tear down at $RUN"; exit 0; }
if [ -f "$RUN/app.pid" ]; then kill "$(cat "$RUN/app.pid")" 2>/dev/null; fi
if [ -f "$RUN/pg/postmaster.pid" ]; then
  runuser -u postgres -- "$PG_BIN/pg_ctl" -D "$RUN/pg" -m fast -w stop >/dev/null
fi
rm -rf "$RUN"
echo "torn down $RUN; evidence kept in $EVIDENCE"
