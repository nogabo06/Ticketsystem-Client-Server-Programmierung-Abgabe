#!/usr/bin/env bash
# Convenience launcher: starts BOTH the backend and the frontend, each in its
# own Terminal window/tab, so you can see both logs and stop them independently.
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting the Ticketsystem backend and frontend in two separate windows..."
echo "Close a window (or press Ctrl+C in it) to stop that server."

if [[ "$OSTYPE" == "darwin"* ]] && command -v osascript >/dev/null 2>&1; then
    # macOS: open two new Terminal.app windows.
    osascript -e "tell application \"Terminal\" to do script \"'$SCRIPT_DIR/start-backend.sh'\""
    osascript -e "tell application \"Terminal\" to do script \"'$SCRIPT_DIR/start-frontend.sh'\""
elif command -v gnome-terminal >/dev/null 2>&1; then
    # Linux with GNOME Terminal.
    gnome-terminal -- bash -c "'$SCRIPT_DIR/start-backend.sh'; exec bash"
    gnome-terminal -- bash -c "'$SCRIPT_DIR/start-frontend.sh'; exec bash"
else
    # Fallback: no known way to open new terminal windows, run both here in the
    # background instead (logs are interleaved, but nothing crashes).
    echo "No supported terminal emulator found for separate windows;"
    echo "running both servers in this window instead (logs will be interleaved)."
    "$SCRIPT_DIR/start-backend.sh" &
    "$SCRIPT_DIR/start-frontend.sh" &
    wait
    exit $?
fi

echo
echo "Done. Two new windows should have opened."
echo "The frontend will be available at http://localhost:5173 once it has started."
