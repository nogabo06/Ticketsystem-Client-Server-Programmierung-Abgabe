@echo off
setlocal

rem Always work from the frontend folder. /d handles a different drive, the
rem quotes handle the spaces in the path ("Finales CS-Projekt").
cd /d "%~dp0frontend"

echo ===========================================================
echo  Starting the Ticketsystem frontend (Vite dev server)
echo  Frontend folder: %CD%
echo  Press Ctrl+C in this window later to stop the server.
echo ===========================================================
echo.

rem Make sure npm / Node.js is available before we try to use it, otherwise the
rem window would just flash and close without an explanation.
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm ^(Node.js^) was not found on your PATH.
    echo.
    echo   - Install Node.js from https://nodejs.org/
    echo   - Make sure typing "npm -v" works in a normal terminal
    echo   - Then run this script again.
    echo.
    pause
    exit /b 1
)

rem Refuse to start a second instance: if port 5173 is already taken Vite would
rem silently start on a different port (5174, ...), leaving two dev servers
rem running. Abort with a clear message instead. PowerShell is used because it is
rem language-independent (netstat prints the state localized, e.g. "ABHOEREN" on
rem a German Windows, so matching the English word "LISTENING" would never match).
powershell -NoProfile -Command "exit [int][bool](Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)"
if errorlevel 1 (
    echo ERROR: Port 5173 is already in use.
    echo.
    echo   The frontend dev server is probably already running in another window.
    echo   ^(Or another program is using port 5173.^)
    echo   Stop it first, then run this script again.
    echo.
    pause
    exit /b 1
)

rem Install dependencies only the first time (when node_modules is missing).
if not exist "node_modules\" (
    echo node_modules not found - installing dependencies, this can take a while...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: "npm install" failed. See the output above.
        pause
        exit /b 1
    )
)

call npm run dev
set EXITCODE=%errorlevel%

echo.
echo Frontend dev server stopped ^(exit code %EXITCODE%^).
pause
