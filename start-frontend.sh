#!/usr/bin/env bash
# Starts the Ticketsystem frontend (Vite dev server). Works from any directory;
# always cds into frontend/ relative to this script's own location.
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend" || exit 1

echo "==========================================================="
echo " Starting the Ticketsystem frontend (Vite dev server)"
echo " Frontend folder: $(pwd)"
echo " Press Ctrl+C in this window later to stop the server."
echo "==========================================================="
echo

# Make sure npm / Node.js is available before we try to use it.
if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm (Node.js) was not found on your PATH."
    echo
    echo "  - Install Node.js from https://nodejs.org/"
    echo "    (or 'brew install node' on macOS)"
    echo "  - Make sure typing \"npm -v\" works in a normal terminal"
    echo "  - Then run this script again."
    exit 1
fi

# Refuse to start a second instance: if port 5173 is already taken Vite would
# silently start on a different port, leaving two dev servers running.
if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:5173 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "ERROR: Port 5173 is already in use."
    echo
    echo "  The frontend dev server is probably already running in another window."
    echo "  (Or another program is using port 5173.)"
    echo "  Stop it first, then run this script again."
    exit 1
fi

# Install dependencies only the first time (when node_modules is missing).
if [ ! -d "node_modules" ]; then
    echo "node_modules not found - installing dependencies, this can take a while..."
    echo
    if ! npm install; then
        echo
        echo "ERROR: \"npm install\" failed. See the output above."
        exit 1
    fi
fi

npm run dev
EXITCODE=$?

echo
echo "Frontend dev server stopped (exit code $EXITCODE)."
exit $EXITCODE
