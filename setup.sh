#!/usr/bin/env bash
# setup.sh — build homehub and run it in the background, replacing any
# running instance.
set -euo pipefail

usage() {
  cat <<'EOF'
setup.sh - build homehub and (re)start it in the background

Usage: ./setup.sh [OPTIONS] [port]

Options:
  -h, --help     show this help and exit

Arguments:
  port           HTTP port to run on (default: 8080)

What it does:
  1. Builds the web frontend (skips npm install if node_modules exists)
  2. Builds the Go binary (./homehub)
  3. Stops any running instance recorded in ./homehub.pid
  4. Starts the new build in the background via nohup
     Logs: ./logs/homehub.out   PID: ./homehub.pid

Examples:
  ./setup.sh           # builds and runs on port 8080
  ./setup.sh 18080     # builds and runs on port 18080
EOF
}

# Parse arguments: -h/--help can appear anywhere; unknown options are rejected.
PORT=""
for arg in "$@"; do
  case "$arg" in
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "error: unknown option: $arg" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [ -n "$PORT" ]; then
        echo "error: unexpected extra argument: $arg" >&2
        usage >&2
        exit 1
      fi
      PORT="$arg"
      ;;
  esac
done

PORT="${PORT:-8080}"
BIN=./homehub
PIDFILE=./homehub.pid
LOGFILE=./logs/homehub.out

echo "Building web frontend..."
(cd web && { [ -d node_modules ] || npm install --silent; } && npm run build)

echo "Building Go binary..."
go build -ldflags="-s -w" -o "$BIN" .

NEW_VERSION="$(date +%Y%m%d%H%M%S)"   # timestamp-based build identifier
echo "new build id: $NEW_VERSION"

mkdir -p ./logs

if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "Stopping old instance (pid $(cat "$PIDFILE"))..."
  kill "$(cat "$PIDFILE")" 2>/dev/null || true
  sleep 1
fi

echo "Starting homehub on :$PORT..."
nohup "$BIN" -port "$PORT" > "$LOGFILE" 2>&1 &
echo $! > "$PIDFILE"
echo "running (pid $(cat "$PIDFILE"), build id $NEW_VERSION), logs at $LOGFILE"
