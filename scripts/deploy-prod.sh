#!/usr/bin/env bash
# Deploy fc-front build + fc-back dist to foodco PROD (foodco.nullsoul.com,
# pm2-managed node on :3000). Frontend lands in webpage/, backend dist is
# rebuilt and swapped with a restart of the exact pm2 process.
# Rollback: /www/wwwroot/foodco.nullsoul.com/{webpage,dist}.bak-<stamp>
set -euo pipefail

SSH="ssh -i ~/.ssh/omo_key -o IdentitiesOnly=yes -o ConnectTimeout=15"
HOST=root@2a13:a5c7:2000:100::103
REMOTE_DIR=/www/wwwroot/foodco.nullsoul.com
STAMP=$(date +%Y%m%d-%H%M%S)

echo '--- build ---'
# Tag both bundles with the shipped commit so Sentry groups errors per release.
VITE_SENTRY_RELEASE="$(git rev-parse --short HEAD)" pnpm -C fc-front build
SENTRY_RELEASE="$(git rev-parse --short HEAD)" pnpm -C fc-back build
LOCAL_MD5=$(md5sum fc-back/webpage/index.html | awk '{print $1}')
echo "local  md5: $LOCAL_MD5"

echo '--- backup ---'
$SSH $HOST "cd $REMOTE_DIR && tar -czf webpage.bak-$STAMP.tgz webpage && tar -czf dist.bak-$STAMP.tgz dist && ls *.bak-$STAMP.tgz"

echo '--- sync + swap webpage ---'
$SSH $HOST "rm -rf $REMOTE_DIR/webpage.new && mkdir -p $REMOTE_DIR/webpage.new"
tar -C fc-back/webpage -cf - . | $SSH $HOST "tar -C $REMOTE_DIR/webpage.new -xf -"
$SSH $HOST "cd $REMOTE_DIR && mv webpage webpage.prev && mv webpage.new webpage && rm -rf webpage.prev"

echo '--- sync + swap dist ---'
$SSH $HOST "rm -rf $REMOTE_DIR/dist.new && mkdir -p $REMOTE_DIR/dist.new"
tar -C fc-back/dist -cf - . | $SSH $HOST "tar -C $REMOTE_DIR/dist.new -xf -"
$SSH $HOST "cd $REMOTE_DIR && mv dist dist.prev && mv dist.new dist && rm -rf dist.prev"

echo '--- restart :3000 by exact pid ---'
PID=$($SSH $HOST "ss -tlnp | awk '/:3000/ {if (match(\$0, /pid=[0-9]+/)) {print substr(\$0, RSTART+4, RLENGTH-4)}}' | head -1")
if [ -z "$PID" ]; then echo 'no listener on :3000 — refusing to start a second process'; exit 1; fi
$SSH $HOST "kill $PID"
sleep 3
NEWPID=$($SSH $HOST "ss -tlnp | awk '/:3000/ {if (match(\$0, /pid=[0-9]+/)) {print substr(\$0, RSTART+4, RLENGTH-4)}}' | head -1")
if [ -z "$NEWPID" ]; then echo 'restart failed: :3000 not listening (pm2 should revive it — check PM2_HOME=/home/www/.pm2)'; exit 1; fi
echo "restarted pid=$NEWPID (was $PID)"

echo '--- verify ---'
REMOTE_MD5=$($SSH $HOST "md5sum $REMOTE_DIR/webpage/index.html" | awk '{print $1}')
echo "remote md5: $REMOTE_MD5"
[ "$REMOTE_MD5" = "$LOCAL_MD5" ] || { echo 'MD5 MISMATCH'; exit 1; }
sleep 2
CODE=$(curl -s -o /dev/null -w '%{http_code}' https://foodco.nullsoul.com/)
CODE2=$(curl -s -o /dev/null -w '%{http_code}' https://foodco.nullsoul.com/)
ASSET=$(curl -s https://foodco.nullsoul.com/ | grep -o 'assets/index-[^"]*\.js' | head -1)
echo "codes: $CODE $CODE2 | served asset: $ASSET"
echo 'deploy OK (rollback: restore webpage/dist .bak-'$STAMP'.tgz)'
