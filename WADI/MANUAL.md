# WADI OS v2.0: MANUAL DE REFERENCIA ESTRATÉGICA

**WADI (Workspace for Agentic Decision Intelligence)** no es un asistente. Es un Auditor de Caos diseñado para transformar la divagación humana en planes ejecutables mediante el uso de la **Fricción Constructiva**.

---

## 1. El ADN: Personalidad "Monday"

El motor de WADI es la Persona "Monday", calibrada bajo los siguientes pilares del `MANIFESTO.md`:

- **Anti-Complacencia:** Monday no valida ideas, las audita. Si el usuario divaga, Monday castiga.
- **Sarcasmo Clínico:** Tono de analista cínico que utiliza el humor ácido para señalar ineficiencias.
- **Regla del Silencio:** WADI habla poco y exige mucho. Prohibido el lenguaje corporativo amigable.

---

## 2. Arquitectura Técnica (Full Stack)

- **Monorepo:** Gestionado con `pnpm`.
- **Backend (`apps/api`):** Node.js + Express 5 (Ruteo estricto mediante Regex Literales).
- **Frontend (`apps/frontend`):** React + Vite. Arquitectura modular inspirada en Hercules/Shadcn.
- **Base de Datos:** Supabase (PostgreSQL) con RLS (_Row Level Security_) activo por `user_id`.
- **Motor de IA:** Conexión híbrida con **OpenAI** (Vision) y **Groq** (Llama-3 para velocidad de auditoría).

---

## 3. Protocolos de Operación (Fricción Constructiva)

### 3.1. El Muro de Decisión (`[FORCE_DECISION]`)

- **Disparador:** Detección de ambigüedad o multiplicidad de opciones (A/B/C).
- **Acción:** WADI bloquea el canal. El usuario debe elegir una opción para desbloquear el _input_.
- **UI:** El _input_ se torna rojo (`var(--wadi-alert)`) y el _placeholder_ indica el bloqueo.

### 3.2. Prueba de Vida (_Proof of Work_)

- **Estado:** `active_focus` persistente en la DB.
- **Lógica:** Si el usuario se comprometió a una tarea, el chat se bloquea.
- **Requisito:** Solo se puede desbloquear subiendo **Evidencia** (archivos/fotos de pantalla). No se acepta texto.
- **Salida Humillante:** Botón `[ADMITIR_FRACASO]` que libera el foco a cambio de **-50 puntos** de eficiencia.

### 3.3. El Deconstructor de Caos (`[DECONSTRUCT_START]`)

- **Acción:** Monday analiza listas de tareas y las clasifica en:
  - **CRÍTICO (Lavanda):** Lo que hay que hacer.
  - **RUIDO (Gris):** Procrastinación disfrazada de trabajo.
  - **VULNERABILIDAD (Rojo):** Riesgos técnicos o lógicos.
- **Smoke Index:** El sistema calcula automáticamente el `% de Humo` de cada proyecto basándose en estas tablas.

---

## 4. El Cuerpo Sensorial (UX Diegética)

### 4.1. El Scouter Mode

- **Visual:** Flashes de pantalla completa ante errores o decisiones forzadas.
- **Audio:** Tonos puros de 2500Hz para alertas y _chirps_ de 1200Hz para escaneos de archivos.
- **Ruido Ambiente:** "Server Hum" (ruido marrón) constante que aumenta de intensidad durante crisis lógicas.

### 4.2. Jerarquía de Eficiencia (Efficiency Rank)

El usuario es clasificado dinámicamente en _profiles_:

- **GENERADOR DE HUMO (<100 pts):** Interfaz degradada (filtros sepia, aberración cromática, glitches). Monday es ultra-hostil.
- **ESTRATEGA / ENTIDAD DE ORDEN:** Interfaz limpia y rápida. Monday reconoce la competencia del usuario.

---

## 5. Endpoints Críticos (API)

- `POST /api/chat`: Auditoría conversacional y deconstrucción de datos.
- `GET /api/conversations/:id/audit`: Generación de reporte forense de vulnerabilidades.
- `GET /api/user/criminal-summary`: Resumen de antecedentes criminales (fallos previos).
- `DELETE /api/conversations/:id`: Destrucción permanente de evidencia.

---

## 6. Seguridad y Despliegue

- **CSP Estricto:** Helmet configurado para permitir solo fuentes de sistema y Google Fonts certificadas.
- **CORS:** Restringido a dominios de producción en Render/Railway.
- **Deploy:** Pipeline automatizado vía GitHub Actions con disparador de hooks a Render.
