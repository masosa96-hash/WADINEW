$ErrorActionPreference = "Stop"

Write-Host "Setting up Android environment..."

# 1. Create local.properties if missing
$LocalPropsPath = "apps/kivo/android/local.properties"
if (-not (Test-Path $LocalPropsPath)) {
    Write-Host "Creating local.properties..."
    $Content = "sdk.dir=C:\\Users\\masos\\AppData\\Local\\Android\\Sdk"
    Set-Content -Path $LocalPropsPath -Value $Content
}

# 2. Check for JAVA_HOME
if (-not $env:JAVA_HOME) {
    Write-Warning "JAVA_HOME is not set. Android builds will fail."
    Write-Warning "Please install JDK 17 and set JAVA_HOME."
} else {
    Write-Host "JAVA_HOME found: $env:JAVA_HOME"
}

# 3. Sync Capacitor
Write-Host "Syncing Capacitor..."
npx cap sync --cwd apps/kivo

Write-Host "Android setup configuration complete."
