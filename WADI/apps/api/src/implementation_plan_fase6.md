# Plan de Implementación - Fase 6: Observabilidad de Negocio 🎯📊

WADI necesita métricas que no solo digan si el sistema está "vivo", sino si está siendo efectivo como **Arquitecto de Producto**. Implementaremos un sistema de eventos desacoplado para capturar indicadores clave sin ensuciar la lógica de negocio.

## User Review Required

> [!IMPORTANT]
> - Se creará un nuevo servicio `metrics.service.ts` que actuará como el "Event Bus" centralizado.
> - Se requiere una pequeña modificación en `CircuitBreaker` para permitir la suscripción a eventos de transición.
> - El esquema de base de datos incluirá nuevas tablas para `token_usage`, `business_metrics` y `cognitive_metrics`.

## Proyectos de Cambio

### 1. Sistema de Eventos Desacoplado [Componente: Core]

#### [NEW] [metrics.service.ts](file:///e:/WADINEW/WADI/apps/api/src/services/metrics.service.ts)
Creación de un bus de eventos basado en `EventEmitter` para desacoplar la generación de métricas de su persistencia.

#### [MODIFY] [circuit-breaker.ts](file:///e:/WADINEW/WADI/apps/api/src/utils/circuit-breaker.ts)
Agregar soporte para callbacks o eventos en las transiciones de estado (`transitionTo`).

### 2. Persistencia de Métricas de Negocio [Componente: DB/Storage]

#### [NEW] [business_metrics.sql]
Esquema para capturar:
- **Resiliencia**: Transiciones de Circuit Breaker.
- **Eficiencia**: Uso de tokens por proyecto/proveedor.
- **Conversión**: Tiempo desde idea hasta estructura lista.
- **Cognición**: Ajustes aplicados por el perfil cognitivo.

### 3. Instrumentación de Servicios [Componente: AI/Brain]

#### [MODIFY] [ai-service.ts](file:///e:/WADINEW/WADI/apps/api/src/services/ai-service.ts)
Conectar los breakers (`smartBreaker`, `fastBreaker`) al `MetricsService`.

#### [MODIFY] [wadi-brain.ts](file:///e:/WADINEW/WADI/apps/api/src/wadi-brain.ts)
Emitir eventos de:
- `TOKEN_USAGE` al recibir completados.
- `PROJECT_CRYSTALLIZATION_COMPLETE` con el tiempo de generación.

#### [MODIFY] [cognitive-service.ts](file:///e:/WADINEW/WADI/apps/api/src/services/cognitive-service.ts)
Emitir eventos de `COGNITIVE_ADJUSTMENT_APPLIED`.

### 4. Admin API [Componente: API]

#### [NEW] [metrics.controller.ts](file:///e:/WADINEW/WADI/apps/api/src/controllers/metrics.controller.ts)
Endpoint `/api/admin/metrics` para obtener un resumen consolidado (insight inicial).

## Plan de Verificación

### Pruebas Automatizadas
- Tests unitarios para el `MetricsService`.
- Verificación de emisión de eventos en `ai-service` y `wadi-brain`.

### Verificacion Manual
- Realizar una cristalización y verificar en la DB que se hayan registrado los tokens y el tiempo de ejecución.
- Consultar el endpoint de admin para ver los indicadores agregados.
