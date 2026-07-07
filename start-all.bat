@echo off
setlocal

rem Convenience launcher: starts BOTH the backend and the frontend, each in its
rem own window so you can see both logs and stop them independently.
cd /d "%~dp0"

echo Starting the Ticketsystem backend and frontend in two separate windows...
echo Close a window (or press Ctrl+C / Enter in it) to stop that server.

start "Ticketsystem Backend"  cmd /k "%~dp0start-backend.bat"
start "Ticketsystem Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo Done. Two new windows should have opened.
echo The frontend will be available at http://localhost:5173 once it has started.
