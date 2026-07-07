#!/usr/bin/env bash
# Starts the Ticketsystem backend. Works from any directory; always cds into
# backend/ relative to this script's own location.
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend" || exit 1

echo "==========================================================="
echo " Starting the Ticketsystem backend"
echo " Backend folder: $(pwd)"
echo " Press Ctrl+C in this window later to stop the server."
echo "==========================================================="
echo

# Make sure Maven is available before we try to use it.
if ! command -v mvn >/dev/null 2>&1; then
    echo "ERROR: Maven (\"mvn\") was not found on your PATH."
    echo
    echo "  - Install Maven from https://maven.apache.org/download.cgi"
    echo "    (or 'brew install maven' on macOS)"
    echo "  - Make sure typing \"mvn -v\" works in a normal terminal"
    echo "  - Then run this script again."
    exit 1
fi

# Refuse to start a second instance: if something already listens on port 8080
# the server cannot bind and would crash with a confusing Java stack trace.
if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:8080 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "ERROR: Port 8080 is already in use."
    echo
    echo "  The backend is probably already running in another window."
    echo "  (Or another program is using port 8080.)"
    echo "  Stop it first, then run this script again."
    exit 1
fi

mvn compile exec:java -Dexec.mainClass="de.hwr.ticketsystem.Main"
EXITCODE=$?

echo
if [ "$EXITCODE" -ne 0 ]; then
    echo "The backend exited with an error (code $EXITCODE). See the output above."
else
    echo "Backend stopped."
fi
exit $EXITCODE
