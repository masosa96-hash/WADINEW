Write-Host "🔧 Ejecutando purga total de tu entorno WADI frontend..."

$frontendPath = "apps\frontend"
$fullPath = Join-Path $PWD $frontendPath

if (!(Test-Path $fullPath)) {
    Write-Host "❌ No se encontró la carpeta apps/frontend. ¿Estás en el lugar correcto?" -ForegroundColor Red
    exit 1
}

Set-Location $fullPath

# Paso 1: Eliminar la mugre
Write-Host "🧹 Borrando node_modules y package-lock.json..."
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force .\package-lock.json -ErrorAction SilentlyContinue

# Paso 2: Purga de cache
Write-Host "🧼 Limpiando cache de npm..."
npm cache clean --force

# Paso 3: Reinstalar todo como si nada hubiese pasado
Write-Host "📦 Ejecutando npm install..."
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "💥 Falló npm install. Algo está profundamente roto." -ForegroundColor Red
    exit 2
}

# Paso 4: Instalar framer-motion (con esperanza)
Write-Host "✨ Instalando framer-motion..."
npm install framer-motion

if ($LASTEXITCODE -ne 0) {
    Write-Host "💥 framer-motion sigue en huelga. Revisá las versiones de tus paquetes." -ForegroundColor Yellow
    exit 3
}

Write-Host "✅ Entorno reseteado. Ahora tu proyecto puede respirar. Más o menos." -ForegroundColor Green
