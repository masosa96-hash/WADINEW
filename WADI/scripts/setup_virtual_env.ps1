$ErrorActionPreference = "Stop"

$ProjectRoot = "E:\WADINEW\WADI"
$ToolsDir = "$ProjectRoot\.tools"
$JdkUrl = "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"
$CmdLineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

# Create tools directory
if (-not (Test-Path $ToolsDir)) {
    New-Item -ItemType Directory -Path $ToolsDir | Out-Null
}

# 1. Setup Java (JDK 17)
$JdkDest = "$ToolsDir\jdk-17.0.2"
if (-not (Test-Path $JdkDest)) {
    Write-Host "Downloading OpenJDK 17..."
    $JdkZip = "$ToolsDir\jdk.zip"
    Invoke-WebRequest -Uri $JdkUrl -OutFile $JdkZip
    
    Write-Host "Extracting OpenJDK 17..."
    Expand-Archive -Path $JdkZip -DestinationPath $ToolsDir -Force
    Remove-Item $JdkZip
}
$env:JAVA_HOME = "$JdkDest"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
Write-Host "JAVA_HOME set to $env:JAVA_HOME"

# 2. Setup Android Command Line Tools
$AndroidHome = "$ToolsDir\android-sdk"
$CmdLineToolsDest = "$AndroidHome\cmdline-tools"

if (-not (Test-Path $CmdLineToolsDest)) {
    Write-Host "Downloading Android Command Line Tools..."
    New-Item -ItemType Directory -Path $AndroidHome | Out-Null
    $CmdToolsZip = "$ToolsDir\cmdline-tools.zip"
    Invoke-WebRequest -Uri $CmdLineToolsUrl -OutFile $CmdToolsZip
    
    Write-Host "Extracting Command Line Tools..."
    # Extract to a temp folder first because the zip structure is cmdline-tools/bin etc.
    # We need it to be cmdline-tools/latest/bin for sdkmanager to work properly
    Expand-Archive -Path $CmdToolsZip -DestinationPath "$AndroidHome\temp_cmd" -Force
    
    $LatestDir = "$CmdLineToolsDest\latest"
    New-Item -ItemType Directory -Path $LatestDir -Force | Out-Null
    
    # Move content from temp_cmd/cmdline-tools to cmdline-tools/latest
    Move-Item -Path "$AndroidHome\temp_cmd\cmdline-tools\*" -Destination $LatestDir
    Remove-Item -Path "$AndroidHome\temp_cmd" -Recurse -Force
    Remove-Item $CmdToolsZip
}

$env:ANDROID_HOME = $AndroidHome
$env:ANDROID_SDK_ROOT = $AndroidHome
$env:Path = "$CmdLineToolsDest\latest\bin;$env:Path"

Write-Host "ANDROID_HOME set to $env:ANDROID_HOME"

# 3. Install SDK Components
Write-Host "Accepting licenses and installing SDK components..."
# Create a file to pipe 'y' to sdkmanager
$YesFile = "$ToolsDir\yes.txt"
"y`ny`ny`ny`ny`ny`n" | Set-Content $YesFile

$SdkManager = "$CmdLineToolsDest\latest\bin\sdkmanager.bat"

# Install Platform Tools, Build Tools, and Platforms
# Using Get-Content to pipe 'y' to accept licenses
Get-Content $YesFile | & $SdkManager "platform-tools" "build-tools;34.0.0" "platforms;android-34" "platforms;android-33"

Write-Host "SDK Components installed."

# 4. Configure local.properties
$LocalProps = "$ProjectRoot\apps\kivo\android\local.properties"
"sdk.dir=$AndroidHome".Replace("\", "\\") | Set-Content $LocalProps
Write-Host "Updated local.properties"

Write-Host "Virtual Android Environment Setup Complete."
