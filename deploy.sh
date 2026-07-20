#!/usr/bin/env bash
# Deploy SubTrack to production server
# Usage: ./deploy.sh

set -e

APP_DIR="/root/subtrack"
REMOTE="root@192.168.1.116"
REMOTE_DIR="/opt/subtrack"

cd "$APP_DIR"

echo "🔨 Building..."
npm run build

echo "📦 Preparing standalone..."
cp -r .next/static .next/standalone/.next/static/

echo "🚀 Deploying to $REMOTE..."
# Core standalone files
tar czf - -C .next/standalone --exclude .next/static .next server.js package.json | \
  ssh "$REMOTE" "cd $REMOTE_DIR && rm -rf .next/static server.js 2>/dev/null; tar xzf -"

# Static files to correct location
tar czf - --transform 's,^,static/,' -C .next/static . | \
  ssh "$REMOTE" "cd $REMOTE_DIR/.next && rm -rf static && tar xzf -"

# Public files
tar czf - -C public . | \
  ssh "$REMOTE" "cd $REMOTE_DIR/public && tar xzf -"

# Source files (for middleware)
tar czf - src/ middleware.ts 2>/dev/null || true

echo "🔄 Restarting service..."
ssh "$REMOTE" "systemctl restart subtrack && sleep 3"

echo "✅ Verifying..."
HTTP_CODE=$(ssh "$REMOTE" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/")
CHUNK_CODE=$(ssh "$REMOTE" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/_next/static/chunks/ 2>/dev/null || echo 'dir'")

echo "  HTTP: $HTTP_CODE"
echo "  Done!"
