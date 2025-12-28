# WADI Final Go-Live Validation Checklist 🚀

## 1. Verificación de Deployment (Render) ✅

- [ ] **Build Status**: Confirmar que el deploy en Render fue exitoso.
- [ ] **Logs de Arranque**: Buscar que el servidor escuche en `0.0.0.0`.
- [ ] **Health Check**: `https://wadi-wxg7.onrender.com/system/health` responde `200 OK`.

## 2. Configuración de Variables (Production Environment) 🔐

Asegurar que las siguientes variables están definidas en el dashboard de Render:

| Variable       | Estado Ideal                       | Validado? |
| :------------- | :--------------------------------- | :-------- |
| `NODE_ENV`     | `production`                       | [ ]       |
| `GROQ_API_KEY` | `gsk_...` (Groq API)               | [ ]       |
| `SUPABASE_URL` | `https://<PROJECT-ID>.supabase.co` | [ ]       |
| `SUPABASE_KEY` | _(Service Role Key)_               | [ ]       |

## 3. Pruebas de Salud (Smoke Tests) 🩺

Ejecutar desde terminal local o navegador:

1.  **Status General**: `curl https://wadi-wxg7.onrender.com/api` (404 expected or json info)

2.  **Health Check**: `curl https://wadi-wxg7.onrender.com/system/health` -> `{"status":"ok",...}`

## 4. (Removed)

Webhooks removed per user request.

## 5. Monitorización Post-Deploy 👁️

- [ ] Revisar panel de logs 10 minutos después del deploy para detectar errores silenciosos.
- [ ] Confirmar que Kivo (Frontend) puede conectar con el Backend (No errores CORS).

---

**Estado Final**: GO / NO-GO
