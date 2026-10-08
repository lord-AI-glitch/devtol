# DevTol — Windows Scheduled Task for Daily Search Engine Indexing
# Run this script in PowerShell to automate daily indexing directly on your Windows PC.

param (
    [switch]$Uninstall,
    [string]$Time = "09:00"
)

$TaskName = "DevTol-Daily-Indexing"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$NodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not $NodeExe) {
    Write-Error "Node.js was not found in PATH. Please install Node.js or add it to PATH."
    exit 1
}

if ($Uninstall) {
    Write-Host "Removing Scheduled Task: $TaskName..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "[OK] Scheduled task successfully removed." -ForegroundColor Green
    exit 0
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  DevTol Daily Indexing Task Scheduler Setup" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$BatPath = Join-Path $ProjectRoot "run-daily-indexing.bat"
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"`"$BatPath`"`"" -WorkingDirectory $ProjectRoot
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Unregister if already exists
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Register the task
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "DevTol Automated Daily Search Engine Indexing"

Write-Host "`n[OK] Task '$TaskName' registered successfully!" -ForegroundColor Green
Write-Host "   - Schedule: Daily at $Time" -ForegroundColor Gray
Write-Host "   - Target: $BatPath" -ForegroundColor Gray
Write-Host "   - Working Directory: $ProjectRoot" -ForegroundColor Gray
Write-Host "`nTo test run immediately in background: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Cyan
Write-Host "To remove task in future: .\scripts\schedule-daily-indexing.ps1 -Uninstall`n" -ForegroundColor Cyan
