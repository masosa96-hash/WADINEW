# WADI Operations Plan: 24/7 Readiness 🚀

## 1. Observability & Monitoring Plan 👁️

### Strategy

Implementar una estrategia de "Tres Pilares": **Logs, Métricas y Traces**.

- **Logs (Estructurados)**:
  - **Herramienta**: `@wadi/logger` (Pino) ya implementado.
  - **Destino**:
    - _Dev_: Consola con `pino-pretty`.
    - _Prod_: Salida JSON estándar (`sdtout`) capturada por el proveedor de nube (Railway/Render/AWS CloudWatch) o enviada a servicio como **Better Stack** o **Datadog**.
  - **Política de Retención**: 30 días en caliente, archivado en S3/Storage tras 30 días.

- **Métricas (Performance)**:
  - **KPIs Vitales**:
    - `Response Time (p95)`: Latencia percibida por el usuario.
    - `Error Rate`: % de respuestas 4xx/5xx.
    - `Throughput`: Requests por segundo (RPS).
  - **Implementación**: Middleware `express-prom-bundle` para exponer `/metrics` (Prometheus format) o integración nativa del PaaS (ej. Railway Metrics).

- **Alertas (Incident Response)**:
  - **Canal Crítico**: Notificación a Telegram/Slack de guardia.
  - **Triggers**:
    - API Health != 200 por 1 minuto.
    - Error Rate > 5% en 5 minutos.
    - CPU/RAM > 80%.

## 2. External Connectors Validation 🔌

### WhatsApp Cloud API

- **Tipo**: Webhook (Inbound) + API Call (Outbound).
- **Validación Requerida**:
  - Verificación de firma `X-Hub-Signature` (Seguridad).
  - Token de verificación (Handshake inicial).
  - Idempotencia (Manejo de reintentos de Meta).

### Telegram Bot API

- **Tipo**: Polling (Dev) / Webhook (Prod).
- **Validación Requerida**:
  - Certificado SSL válido (HTTPS obligatorio).
  - Secret Token en cabecera para validar origen.

## 3. Admin Panel & Sessions 🛠️

### Arquitectura Simplificada

En lugar de construir un frontend complejo de cero, expondremos endpoints seguros consumibles por herramientas _Low-Code_ (como **Retool** o **Appsmith**) o un dashboard simple en React.

- **Endpoints de Admin (`/admin/*`)**:
  - `GET /admin/health`: Estado detallado de dependencias (DB, OpenAI, etc).
  - `GET /admin/logs`: Últimos N logs (si se almacenan local/DB).
  - `GET /admin/sessions`: Usuarios activos.
- **Seguridad**: `x-admin-key` header o Auth Middleware específico.

## 4. Stability & Load Testing 🏋️

### Herramienta: [k6](https://k6.io/) by Grafana

Definir scripts de prueba de carga para simular tráfico pico.

- **Escenarios**:
  1. **Smoke Test**: 5 usuarios concurrentes (Verificar funcionalidad básica).
  2. **Load Test**: 50 usuarios concurrentes (Tráfico normal esperado).
  3. **Stress Test**: 200+ usuarios concurrentes (Punto de quiebre).

### Health Checks

- **Liveness Probe** (`/health/live`): ¿El proceso está corriendo? -> Reiniciar si falla.
- **Readiness Probe** (`/health/ready`): ¿Puede aceptar tráfico? (DB conectada, Redis listo).

## 5. Operations & Reliability 🛡️

- **Backups**:
  - **Database**: Dump diario automático (Supabase lo maneja, configurar PITR).
  - **Config**: Variables de entorno seguras en CI/CD secrets.
- **Log Rotation**:
  - No rotar en archivo local (mala práctica en contenedores). Usar driver de Docker/PaaS que rote y envíe a agregador de logs.

## 6. GO-LIVE Checklist ✅

- [ ] **Security**: `cors` restringido a dominios reales. `helmet` activado.
- [ ] **Env Vars**: Todas las secrets de producción cargadas (NO `.env` files).
- [ ] **CI/CD**: Pipeline pasando en verde en `main`.
- [ ] **Database**: Migraciones aplicadas en Producción.
- [ ] **Domain**: SSL/TLS forzado (HSTS).
- [ ] **Observability**: Dashboard de métricas accesible y recibiendo datos.
