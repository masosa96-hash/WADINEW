$ProjectRoot = "E:\WADINEW\WADI"
$ToolsDir = "$ProjectRoot\.tools"

$env:JAVA_HOME = "$ToolsDir\jdk-17.0.2"
$env:ANDROID_HOME = "$ToolsDir\android-sdk"
$env:ANDROID_SDK_ROOT = "$ToolsDir\android-sdk"

# Add to Path
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

Write-Host "Virtual Environment Loaded."
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
