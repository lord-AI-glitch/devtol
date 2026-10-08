@echo off
setlocal
cd /d "%~dp0"

if not exist logs mkdir logs

set LOG_FILE=logs\daily-indexing.log

echo ==================================================== >> "%LOG_FILE%"
echo [%DATE% %TIME%] Starting DevTol Daily Search Engine Indexing... >> "%LOG_FILE%"
echo ====================================================
echo Starting DevTol Daily Search Engine Indexing...
echo ====================================================

echo [1/2] Submitting to Bing and Global IndexNow Engines...
node scripts\submit-indexnow.mjs >> "%LOG_FILE%" 2>&1
echo [OK] IndexNow completed. See logs\daily-indexing.log for details.

echo.
echo [2/2] Submitting to Google Indexing API (Daily Dynamic 200 URLs)...
node scripts\submit-google-indexing.mjs --daily --limit=200 >> "%LOG_FILE%" 2>&1
echo [OK] Google Indexing process completed. See logs\daily-indexing.log for details.

echo.
echo ====================================================
echo [%DATE% %TIME%] Daily Indexing Cycle Finished.
echo [%DATE% %TIME%] Daily Indexing Cycle Finished. >> "%LOG_FILE%"
echo ==================================================== >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

endlocal
exit /b 0
