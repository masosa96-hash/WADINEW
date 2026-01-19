# WADI: RADIOGRAFÍA TÉCNICA (2026-01-19)

## 1. Definición de Rutas (Backend)
**Ubicación**: `apps/api/src/api-routes.ts`

```typescript
// Resumen de endpoints activos
router.get("/projects", authenticate(), ...)      // Listar
router.post("/projects", authenticate(), ...)     // Crear
router.delete("/projects/bulk", authenticate(), ...)// Borrado Masivo
router.delete("/projects/:id", authenticate(), ...) // Borrado Individual

// Sub-recurso: Runs
router.get("/projects/:id/runs", authenticate(), listRuns) // Listar ejecuciones del proyecto
router.post("/projects/:id/runs", authenticate(), createRun) // Crear ejecución

// Crystallization (Magic)
router.post("/projects/crystallize", authenticate(), ...) // Convierte idea -> Proyecto
router.get("/projects/suggestions/pending", authenticate(), ...) // Polling de sugerencias

// Knowledge / RAG
router.post("/documents/upload", authenticate(), ...) // Ingesta de archivos
router.post("/memory/reflect", authenticate(), ...)   // "Reflexión" sobre chats recientes

// User Prefs
router.patch("/user/preferences", authenticate(), ...) // Setear idioma, tema, persona
```

## 2. Esquema de Base de Datos (Supabase)
**Tablas Principales Extractadas:**

### `projects`
*   `id`: UUID (Primary Key)
*   `user_id`: UUID (FK -> auth.users)
*   `name`: TEXT
*   `description`: TEXT
*   `status`: TEXT ('PLANNING', 'IN_PROGRESS', 'DONE', etc.)
*   `created_at`: TIMESTAMPTZ

### `runs`
*   `id`: UUID (Primary Key)
*   `project_id`: UUID (FK -> projects.id)
*   `input`: TEXT (Prompt del usuario)
*   `output`: TEXT (Respuesta de la IA)
*   `model`: TEXT (ej: 'gpt-4o', 'llama-3.1')
*   `created_at`: TIMESTAMPTZ

### `wadi_knowledge_base` (Memoria RAG)
*   `id`: UUID
*   `user_id`: UUID (FK)
*   `knowledge_point`: TEXT (El "hecho" o "idea" aprendida) - **Nota: Columna renombrada desde 'content'**
*   `category`: TEXT (ej: 'Personal', 'Project', 'PREFERENCE')
*   `confidence_score`: INT (Default: 1)
*   `created_at`: TIMESTAMPTZ

## 3. Lógica de "Knowledge"
**Ubicación**: `apps/api/src/services/knowledge-service.ts`

```typescript
export const extractAndSaveKnowledge = async (userId: string, userMessage: string) => {
    // 1. LLM detecta si hay "hechos" o "intenciones de proyecto"
    // Prompt interno: "Analiza el mensaje... Extrae hechos... Detecta INTENCIÓN CLARA..."
    // Output JSON: { content, category, is_new_project_intention }
    
    // 2. Si detecta intención, guarda con categoría 'PROJECT_SUGGESTION'
    // 3. Inserta en tabla `wadi_knowledge_base`
};

export const getRelevantKnowledge = async (userId: string) => {
    // Recupera los últimos 10 hechos de `wadi_knowledge_base`
    // Los formatea como string: "[CATEGORIA]: Contenido"
    // Se inyecta en el System Prompt de `wadi-brain.ts`
};
```

## 4. El "Glue" del Frontend
**Ubicación**: `apps/frontend/src/config/api.ts`

```typescript
// Lógica de URL base con fallback a localhost
const cleanBaseUrl = (url: string) => url.replace(/\/+$/, "");
const envApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Normalización automática de /api
export const API_URL = envApiUrl.endsWith("/api") 
    ? envApiUrl 
    : `${cleanBaseUrl(envApiUrl)}/api`;

// Generador de Headers standard (Auth)
export const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
```

## 5. Pendientes Inmediatos (Blockers & Risks)

1.  **Verificación de "Runs"**: No hemos validado visualmente que la UI de Runs (historial de prompts dentro de un proyecto) exista o funcione. El código de store existe (`runsStore.ts`), pero la integración en la vista está pendiente de revisión.
2.  **Validación de Flujo "Crystallize"**: El backend tiene el endpoint y el frontend el polling, pero falta testear "end-to-end" que una idea sugerida en el chat realmente cree el proyecto y redirija al usuario sin errores.
3.  **Estabilidad de Providers Híbridos**: `ai-service.ts` hace switch entre OpenAI y Groq. Necesitamos asegurar que si falta una key, el fallback sea gracioso y no explote el backend.
