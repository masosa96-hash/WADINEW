# Guía de Verificación Técnica y Mantenimiento PWA - Kivo 5.0

Esta guía garantiza que la PWA de Kivo se despliegue correctamente en Firebase Hosting sin errores de recursos y con un ciclo de vida de Service Worker saludable.

## 1. Verificación Manual Post-Despliegue

Abre [Kivo Web](https://kivo-8c62e.web.app) en Chrome Incognito para evitar cachés previas.

### ✅ Estado del Service Worker

1. Abre DevTools (`F12`) > **Application** > **Service Workers**.
2. Verifica que el Status sea `Activated` y corriendo.
3. El nombre debe ser `kivo-v5` (definido en `sw.js`).
4. Si ves "waiting to activate", haz clic en "skipWaiting" (esto ya debería ser automático con la última actualización).

### ✅ Carga de Recursos (Network)

1. Ve a la pestaña **Network**.
2. Filtra por **"All"** y recarga la página (`Ctrl + R`).
3. Verifica que NO haya líneas rojas (404).
4. Confirma la carga exitosa de:
   - `favicon.ico` (200 OK)
   - `manifest.json` (200 OK)
   - `sw.js` (200 OK)
   - `pop.mp3` (200 OK - puede que no se cargue hasta que se use, verificar en `Preload` si aplica o intentar reproducir sonido).
   - `kivo-icon.png` (200 OK).

### ✅ Instalación (Manifest)

1. Ve a la pestaña **Application** > **Manifest**.
2. No debe haber errores ni advertencias.
3. Los iconos deben mostrarse correctamente.
4. "App installability" no debe tener advertencias bloqueantes.

## 2. Optimización y Mantenimiento

### 🔄 Ciclo de Vida del Service Worker

Hemos añadido `self.skipWaiting()` y `self.clients.claim()` en `sw.js`. Esto asegura que:

- **skipWaiting**: El nuevo SW se instala y activa inmediatamente sin esperar a que el usuario cierre todas las pestañas.
- **clients.claim**: El nuevo SW toma control de la página inmediatamente, sirviendo los nuevos assets al instante.

### 🧹 Limpieza de Caché

El evento `activate` incluye una lista blanca (`CACHE_NAME = 'kivo-v5'`). Cualquier caché antigua (ej: `kivo-v4`) será borrada automáticamente.

### 🚀 Compresión y HTTP/2

Firebase Hosting habilita automáticamente HTTP/2 y compresión Brotli/Gzip para todos los recursos estáticos. No se requiere configuración adicional.

## 3. Integración en Monorepo

Actualmente el ecosistema WADI convive pero no está fuertemente acoplado en código:

- **Kivo (apps/kivo)**:
  - Frontend independiente (Vanilla JS).
  - Consume `kivo-brain-api` vía URL directa de Railway.
  - Usa Firebase solo para Hosting y Firestore (configurado en `firebase-config.js`).

- **Frontend (apps/frontend)**:
  - Proyecto React/Vite.
  - Configurado con Supabase.
  - Aún no consme `wadi-api` activamente en el código base revisado.

## 4. Comandos Útiles

**Desplegar solo Kivo:**

```bash
pnpm --filter kivo build # (Si tuviera build step, actualmente es copia estática)
cd apps/kivo
firebase deploy --only hosting
```

**Verificar caché local PWA:**
En DevTools > Application > Storage > "Clear Site Data" para resetear completamente el estado del cliente si encuentras problemas extraños.
