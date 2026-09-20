@echo off
chcp 65001 >nul
set "PATH=%~dp0..\node js;%PATH%"
cd /d "%~dp0"
if not exist ".env" copy ".env.example" ".env" >nul
echo Dang chay Kinie tai http://localhost:3000  (dong cua so nay de tat)
start "" http://localhost:3000
node server.js
pause
