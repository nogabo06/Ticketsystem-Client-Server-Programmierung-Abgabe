@echo off
setlocal

rem Always work from the backend folder, no matter where the script is launched
rem from. /d also handles a different drive, and the quotes handle the spaces in
rem the path ("Finales CS-Projekt").
cd /d "%~dp0backend"

echo ===========================================================
echo  Starting the Ticketsystem backend
echo  Backend folder: %CD%
echo  Press Enter in this window later to stop the server.
echo ===========================================================
echo.

rem Make sure Maven is available before we try to use it. If it is missing the
rem window would otherwise just flash and close without an explanation.
where mvn >nul 2>nul
if errorlevel 1 (
    echo ERROR: Maven ^("mvn"^) was not found on your PATH.
    echo.
    echo   - Install Maven from https://maven.apache.org/download.cgi
    echo   - Make sure typing "mvn -v" works in a normal terminal
    echo   - Then run this script again.
    echo.
    pause
    exit /b 1
)

rem Refuse to start a second instance: if something already listens on port 8080
rem the server cannot bind and would crash with a confusing Java stack trace.
rem PowerShell's Get-NetTCPConnection is used because it is language-independent
rem (netstat prints the state localized, e.g. "ABHOEREN" on a German Windows, so
rem matching the English word "LISTENING" would silently never match).
powershell -NoProfile -Command "exit [int][bool](Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue)"
if errorlevel 1 (
    echo ERROR: Port 8080 is already in use.
    echo.
    echo   The backend is probably already running in another window.
    echo   ^(Or another program is using port 8080.^)
    echo   Stop it first, then run this script again.
    echo.
    pause
    exit /b 1
)

rem "call" is required because mvn is itself a .cmd script; without it control
rem would not return to this batch file.
call mvn compile exec:java -Dexec.mainClass="de.hwr.ticketsystem.Main"
set EXITCODE=%errorlevel%

echo.
if not "%EXITCODE%"=="0" (
    echo The backend exited with an error ^(code %EXITCODE%^). See the output above.
) else (
    echo Backend stopped.
)
echo.
pause
