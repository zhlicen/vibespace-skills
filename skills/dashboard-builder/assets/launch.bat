@echo off
REM launch.bat - one-click dashboard launcher (Windows)
REM The agent bakes in the correct node path at handoff (Stage 8).
REM Double-click this file to start the dashboard and open it in the browser.

cd /d "%~dp0"
set NODE=runtime\node-v22.11.0-win-x64\node.exe

if not exist "%NODE%" (
  echo Could not find the runtime. Please ask the person who set this up to run preflight again.
  pause
  exit /b 1
)

REM open the browser shortly after the server starts
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3200"

echo Starting dashboard... keep this window open. Close it to stop the dashboard.
"%NODE%" server.js
pause
