<!-- markdownlint-disable MD024 -->

# 📦 CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
This project _intentionally_ does not follow Semantic Versioning.  
We do what we want.

---

## [2.0.0] - 2025-12-28

### Added

- **WADI CLI**: Herramienta de línea de comando local (`cli/`) para gestión del proyecto.
- **CI/CD**: Workflow de GitHub Actions (`wadi-ci.yml`) para linting y build automático.
- **Documentación Interna**: Nueva guía de onboarding `docs/USO.md`.
- **Infraestructura**: Configuración preparada para dominios personalizados en `docs/CNAME`.

## [1.0.0] - 2025-12-28

### Added

- Sistema de branding completo para WADI.
- Tema visual "Deep Bunker" aplicado a toda la interfaz.
- Documentación inicial (`README.md`) terminada.
- Entrada de terminal funcional (TerminalInput.tsx).
- Backend `wadi-brain.js` con motor de respuesta contextual.
- Limpieza total de código no usado (bye `useChatStore`, `playTone`, etc).
- Favicon personalizado (`wadi.svg`).

### Removed

- Componentes basura como "Brainstorming", "Plan de Negocio", etc.
- Todas las referencias a "Monday".
- Sonido. Todo. Absolutamente todo.

### Fixed

- Warnings de ESLint en componentes clave.
- `useEffect` con dependencias faltantes en Sidebar.
- Form inputs sin `id` o `name`.

---

## [UNRELEASED]
### Added - Phase 1 Implementation (May 17, 2026)

#### 🏥 Health Check Improvements
- **Professional health check endpoints**: 
  - `GET /health` - Readiness probe (validates DB connectivity)
  - `GET /health/live` - Liveness probe (container orchestrator friendly)
  - `GET /health/ready` - Readiness probe for load balancers
  - `GET /api/health` - API alias for frontend compatibility
- **Health Check Service** (`services/health.service.ts`): Validates API, database, and environment variables

#### 🔍 Observability & Debugging
- **Request ID Middleware** (`middleware/requestId.middleware.ts`): Unique ID per request for correlation/tracing
- **Enhanced Error Handler**: Structured Pino logging with correlation IDs
- **Request ID in Response Headers**: All responses include `X-Request-ID` header

#### 🧪 Testing Consolidation
- **Unified Integration Test Suite** (`tests/integration.test.ts`): 
  - Health checks validation
  - WADI personality tests
  - Error handling tests
  - Security headers validation
  - Smoke tests
  - Performance baseline tests
- **Consolidated test organization**: Moved from fragmented `wadi-tests.js`, `smoke-test.js`, and `smoke-test-v1.1.ts` into single Vitest suite

#### 🔧 Configuration & Cleanup
- **Enhanced .gitignore**: Added patterns for generated files, test outputs, and temporary test directories
- **Health Check Routes** (`routes/health.routes.ts`): Professional implementation with logging

### Changed
- Migrated from inline health checks to dedicated route file
- Request logging now includes correlation IDs for better traceability

### Deprecated
- `apps/tests/wadi-tests.js` - Use `apps/api/src/tests/integration.test.ts` instead
- `scripts/smoke-test.js` - Use `apps/api/src/tests/integration.test.ts` instead  
- `tmp/smoke-test-v1.1.ts` - Use `apps/api/src/tests/integration.test.ts` instead

### Security
- Added Helmet security headers (already active, now validated in tests)
- Request ID prevents log injection attacks and improves tracing

### Added - Phase 2 Implementation (May 17, 2026)
- Added Swagger UI docs at `GET /api-docs`.
- Added OpenAPI spec at `GET /api-docs.json`.
- Added standardized error response formatting middleware.
- Added request correlation header support in request logger.
- Added tests for API documentation routes and error normalization.

---

## [UNRELEASED] - Previous (Planning)
Things that _will probably break everything_ if you’re not careful:

### Planning

- Modo de contexto persistente (¿state manager o base de datos?).
- Integración con APIs externas (OpenAI, Langchain, HuggingFace, etc).
- WADI con personalidad dinámica (modo irónico, formal, técnico, etc).
