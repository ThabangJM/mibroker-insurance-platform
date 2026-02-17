@echo off
echo Manual deployment helper for GitHub Pages
echo.
echo 1. Make sure you have built the project: npm run build
echo 2. The built files are in the 'dist' folder
echo 3. You need to upload these files to the gh-pages branch of your repository
echo.
echo Current build files:
dir dist
echo.
echo To deploy manually:
echo 1. Go to your GitHub repository: https://github.com/ThabangJM/mibroker-insurance-platform
echo 2. Switch to the gh-pages branch (or create it)
echo 3. Upload the contents of the 'dist' folder to the root of the gh-pages branch
echo 4. Enable GitHub Pages in repository settings
echo.
pause