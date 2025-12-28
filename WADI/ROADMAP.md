# WADI Technical Roadmap - Q1 2026

## 🎯 Objetivos Principales

1. **Consolidación de Código**: Migrar a una arquitectura monorepo estricta y tipada.
2. **Escalabilidad**: Preparar backend y frontend para alta concurrencia.
3. **Comercialización**: Implementar métricas, feature flags y estabilidad garantizada.

---

## 📅 Hitos Mensuales

### Mes 1: Consolidación y Calidad (Arquitectura)

**Foco:** Deuda técnica y estandarización.

- [x] **Monorepo Setup**: Configurar pnpm workspaces, ESLint y Prettier global.
- [x] **Shared Packages**: Crear `@wadi/logger` y mover utilidades comunes (auth, dates) a `packages/utils`.
- [ ] **TypeScript Migration**: Migrar `apps/api` y `apps/kivo-brain-api` a TypeScript completo.
- [ ] **Testing Strategy**: Alcanzar 80% coverage en lógica de negocio crítica (Jest/Vitest).
- [ ] **Unified API Gateway**: Evaluar unificar endpoints bajo un solo dominio/gateway si aplica.

### Mes 2: Integración y Performance (Infraestructura)

**Foco:** Velocidad y robustez.

- [ ] **Database Optimization**: Índices en Supabase/PostgreSQL y revisión de queries lentas.
- [ ] **Caching Layer**: Implementar Redis para respuestas frecuentes de la API (Brain).
- [ ] **CDN & Assets**: Optimizar entrega de media (imágenes, audios) via Cloud/CDN.
- [ ] **Staging Environments**: Replicar entornos de Railway para Dev/Staging automáticos.
- [ ] **Monitoring**: Implementar Sentry para tracking de errores real-time y LogRocket para UX replay.

### Mes 3: Producto y Comercialización (Growth)

**Foco:** Usuarios y negocio.

- [ ] **Analytics & Telemetry**: Dashboard de uso (Mixpanel o PostHog) para entender comportamiento v5.
- [ ] **Feature Flags**: Implementar sistema (ej. LaunchDarkly o config propia) para A/B testing de nuevas "voces" de Kivo.
- [ ] **User Accounts V2**: Refinar flujo de onboarding, recuperación de cuentas y perfilamiento.
- [ ] **Payment Integration**: (Si aplica) Preparar estructura para suscripciones premium.
- [ ] **Security Audit**: Scan de vulnerabilidades (OWASP ZAP) y rotación de secretos.

---

## 🛠️ Estándares Técnicos Definidos

- **Lenguaje**: TypeScript (Strict Mode).
- **Estilo**: ESLint (Google/Airbnb base modificado) + Prettier.
- **Commits**: Conventional Commits (feat: , fix: , chore:).
- **Branches**: Git Flow simplificado (main = prod, features/ = dev).
- **Logs**: JSON estructurado (Pino) con Trace ID para trazabilidad distribuida.
