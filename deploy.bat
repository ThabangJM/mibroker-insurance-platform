@echo off
echo Adding Git to PATH and deploying to GitHub Pages...
set PATH=%PATH%;C:\Program Files\Git\bin
npm run deploy
pause