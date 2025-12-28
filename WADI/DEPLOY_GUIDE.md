# WADI Production Deployment Guide 🚀

## 0. Repository Check (CRITICAL) 🚨

Asegúrate de que el servicio en Render esté conectado al repositorio correcto:

- **Repo Correcto**: `masosa96-hash/WADINEW`
- **Branch**: `master`

Si Render está apuntando a `masosa96-hash/WADI`, debes cambiar el repositorio en la configuración del servicio (Settings -> Repository) o crear un nuevo Static Site / Web Service apuntando a `WADINEW`.

## 1. Environment Configuration (Secrets) 🔐

Antes de desplegar, debes configurar estas variables en tu proveedor (Railway/Render).

He generado claves seguras y aleatorias para ti. **Cópialas y guárdalas en un gestor de contraseñas AHORA.**

| Variable                | Valor Generado                                                  | Propósito                            |
| :---------------------- | :-------------------------------------------------------------- | :----------------------------------- |
| `ADMIN_KEY`             | `9b03e6028bbb01b40aebfecdf86b6025a74c6513ec25cc1cae0f8c3597d92` | Protege `/system/admin/metrics`      |
| `WHATSAPP_VERIFY_TOKEN` | `1773993bfa7e4f497e09092cc8b0f22c`                              | Token para verificar Webhook de Meta |
| `TELEGRAM_SECRET_TOKEN` | `68a4a187fda9e8bec935c38daa826ffdf5c1cc456d5177c49`             | Token secreto en headers de Telegram |

### Pasos en Railway

1. Ve a tu proyecto -> `wadi-api`.
2. Pestaña **Variables**.
3. Añade las 3 variables con los valores de arriba. (O usa el CLI: `railway vars set ADMIN_KEY=...`)

---

## 2. Webhook Registration 📡

### WhatsApp Cloud API (Meta Developers)

1. Ve a [Developers.facebook.com](https://developers.facebook.com/) -> Tu App -> WhatsApp -> Configuration.
2. **Callback URL**: `https://<TU-DOMINIO-API-EN-RAILWAY>/webhooks/whatsapp`
3. **Verify Token**: `1773993bfa7e4f497e09092cc8b0f22c` (El valor de arriba).
4. Click **Verify and Save**. (Si falla, asegúrate de haber desplegado primero).

### Telegram Bot API

Ejecuta esto en tu navegador o terminal (reemplaza `<BOT_TOKEN>` y `<TU-DOMINIO>`):

```bash
curl -F "url=https://<TU-DOMINIO-API-EN-RAILWAY>/webhooks/telegram" \
     -F "secret_token=68a4a187fda9e8bec935c38daa826ffdf5c1cc456d5177c49" \
     https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
```

---

## 3. Smoke Tests (Post-Deploy) 🕵️

Ejecuta estos comandos `curl` para validar que todo esté operando correctamente. Reemplaza `localhost` con tu dominio de prod si ya desplegaste.

**1. System Health (Público):**

```bash
curl https://<DOMINIO>/system/health
# Expected: {"status":"ok", "uptime":...}
```

**2. System Readiness (DB Check):**

```bash
curl https://<DOMINIO>/system/ready
# Expected: {"status":"ready", "integrations":...}
```

**3. Admin Metrics (Protegido):**

```bash
# Intento fallido (401)
curl -I https://<DOMINIO>/system/admin/metrics

# Intento exitoso (200)
curl -H "x-admin-key: 9b03e6028bbb01b40aebfecdf86b6025a74c6513ec25cc1cae0f8c3597d92" https://<DOMINIO>/system/admin/metrics
```

---

## 4. Risks & Rollback ⚠️

- **Riesgo 1**: Webhook de WhatsApp falla verificación.
  - _Solución_: Revisa logs (`/admin/logs` si implementado) y verifica que el token coincida EXACTAMENTE.
- **Riesgo 2**: API Crachea por memoria.
  - _Solución_: Revisa métricas en `/system/admin/metrics`. Si `memory.rss` > 512MB, considera escalar el plan en Railway.
- **Rollback**:
  - En Railway/Render, usa el botón "Revert to previous commit" en la pestaña de Deployments.

---

## 5. Documentation Deployment (GitHub Pages) 📚

La documentación del proyecto (`/docs`) se sirve automáticamente mediante GitHub Pages.

### Configuración de Dominio Personalizado

1. **Editar CNAME**:
   - Modifica el archivo `docs/CNAME` con tu dominio real (ej: `docs.midominio.com` o `wadi.com`).

2. **Configurar DNS Provider**:
   - Si usas un **Subdominio** (ej: `docs.midominio.com`):
     - Crea un registro `CNAME` apuntando a `masosa96-hash.github.io`.
   - Si usas el **Dominio Raíz** (ej: `midominio.com`):
     - Crea 4 registros `A` apuntando a nuestras IPs de GitHub:
       - `185.199.108.153`
       - `185.199.109.153`
       - `185.199.110.153`
       - `185.199.111.153`

3. **Activar en GitHub**:
   - Ve a `Settings` -> `Pages`.
   - Asegúrate que `Custom domain` coincida con el contenido de tu archivo `CNAME`.
   - Marca la casilla **Enforce HTTPS**.

---

## 🛑 CHECKLIST FINAL

Marca estos pasos a medida que avanzas:

- [ ] Secrets configurados en Cloud.
- [ ] Deploy exitoso (Build green).
- [ ] Webhook de WhatsApp Verificado (Green check).
- [ ] Smoke Test `/health` OK.
- [ ] Smoke Test `/ready` OK.
- [ ] Admin Access OK.
- [ ] Documentación accesible en URL pública.

¡Buena suerte con el lanzamiento! 🚀
