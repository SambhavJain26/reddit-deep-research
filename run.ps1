# 1-Command Startup Script for Reddit Deep Research
# Launches both the Flask Multi-Agent Backend (port 5001) and Vite React Frontend (port 8080)
[CmdletBinding()]
param(
    [switch]$NoBrowser
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
Push-Location $repoRoot

$backendProcess = $null
$frontendProcess = $null

try {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " Starting Reddit Deep Research Engine" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan

    # 1. Check .env configuration
    $envFile = Join-Path $repoRoot ".env"
    if (-not (Test-Path $envFile)) {
        Write-Host "[Setup] No .env found. Copying from .env.example..." -ForegroundColor Yellow
        Copy-Item (Join-Path $repoRoot ".env.example") $envFile
        Write-Host "[Setup] Created .env template. Please configure your OPENAI_API_KEY and TAVILY_API_KEY before running." -ForegroundColor Red
        return
    }

    # 2. Verify Python virtual environment
    $venvPython = Join-Path $repoRoot ".venv\Scripts\python.exe"
    if (-not (Test-Path $venvPython)) {
        Write-Host "[Setup] Python virtual environment not found. Initializing .venv..." -ForegroundColor Yellow
        if (Get-Command uv -ErrorAction SilentlyContinue) {
            uv venv
            uv pip install flask flask-cors openai tavily-python pydantic python-dotenv
        } else {
            python -m venv .venv
            & $venvPython -m pip install --upgrade pip
            & $venvPython -m pip install flask flask-cors openai tavily-python pydantic python-dotenv
        }
        Write-Host "[Setup] Python dependencies installed successfully." -ForegroundColor Green
    }

    # 3. Verify Node.js frontend dependencies
    $nodeModules = Join-Path $repoRoot "node_modules"
    if (-not (Test-Path $nodeModules)) {
        Write-Host "[Setup] Frontend node_modules not found. Running npm install..." -ForegroundColor Yellow
        npm install
        Write-Host "[Setup] Frontend dependencies installed successfully." -ForegroundColor Green
    }

    # 4. Set Python UTF-8 encoding environment variables for Windows console safety
    $env:PYTHONIOENCODING = "utf-8"
    $env:PYTHONUTF8 = "1"

    # 5. Start Flask Backend on Port 5001
    Write-Host "[1/2] Launching Flask multi-agent backend on http://localhost:5001..." -ForegroundColor Green
    $backendPsi = New-Object System.Diagnostics.ProcessStartInfo
    $backendPsi.FileName = $venvPython
    $backendPsi.Arguments = "backend\app.py"
    $backendPsi.WorkingDirectory = $repoRoot
    $backendPsi.UseShellExecute = $false
    $backendProcess = [System.Diagnostics.Process]::Start($backendPsi)

    # Allow backend 2 seconds to initialize
    Start-Sleep -Seconds 2

    # 6. Start Vite Frontend on Port 8080
    Write-Host "[2/2] Launching Vite React frontend on http://localhost:8080..." -ForegroundColor Green
    $frontendPsi = New-Object System.Diagnostics.ProcessStartInfo
    $frontendPsi.FileName = "cmd.exe"
    $frontendPsi.Arguments = "/c npm run dev"
    $frontendPsi.WorkingDirectory = $repoRoot
    $frontendPsi.UseShellExecute = $false
    $frontendProcess = [System.Diagnostics.Process]::Start($frontendPsi)

    Start-Sleep -Seconds 3

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " All systems running:" -ForegroundColor Green
    Write-Host " - Frontend UI:      http://localhost:8080" -ForegroundColor White
    Write-Host " - Backend API:      http://localhost:5001" -ForegroundColor White
    Write-Host " - Health Check:     http://localhost:5001/health" -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Gray
    Write-Host ""

    if (-not $NoBrowser) {
        Start-Process "http://localhost:8080"
    }

    # Keep script open until user hits Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }

} finally {
    Write-Host ""
    Write-Host "Shutting down background services..." -ForegroundColor Yellow

    if ($backendProcess -and -not $backendProcess.HasExited) {
        $backendProcess.Kill()
        Write-Host "Stopped Flask backend process." -ForegroundColor Gray
    }

    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        $frontendProcess.Kill()
        Write-Host "Stopped Vite frontend process." -ForegroundColor Gray
    }

    # Clean up any dangling processes on port 5001 or 8080
    $p5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($p5001) { Stop-Process -Id $p5001 -Force -ErrorAction SilentlyContinue }

    $p8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($p8080) { Stop-Process -Id $p8080 -Force -ErrorAction SilentlyContinue }

    Pop-Location
    Write-Host "Shutdown complete." -ForegroundColor Green
}
