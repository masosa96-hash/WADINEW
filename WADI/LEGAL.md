# Legal & Propiedad Intelectual

## 1. Propiedad del Proyecto

Todo el código fuente, diseño, textos, flujos y activos contenidos en este repositorio ("WADI") son propiedad exclusiva del **Usuario** (titular del repositorio).

Esto incluye, pero no se limita a:

- **Frontend y Backend**: Todo el código de la aplicación (React, Node.js, etc.).
- **WADI Brain**: El "System Prompt", la personalidad definida, el tono (e.g. "Monday Mode"), y las instrucciones de comportamiento del asistente.
- **Branding**: El nombre "WADI" y su identidad visual.

## 2. Uso por Antigravity (IA)

Antigravity (el asistente de desarrollo) y/o cualquier sistema de IA utilizado para generar código en este proyecto:

- **NO** retiene derechos de propiedad sobre el código generado o modificado.
- **NO** tiene permiso para reutilizar, distribuir o replicar la personalidad, textos o lógica específica de WADI en otros proyectos o para otros usuarios sin autorización explícita.
- **NO** utilizará los datos de este proyecto para entrenamiento de modelos generales sin consentimiento explícito.

## 3. Privacidad y Datos

- **Credenciales**: Todas las claves de API y credenciales se manejan estrictamente mediante variables de entorno (`.env`) y no se almacenan en el código fuente.
- **Datos de Usuario**:
  - **Chat Efímero**: Las conversaciones de chat en modo invitado (página principal) se almacenan principalmente en memoria (RAM) y son efímeras.
  - **Proyectos y Runs**: Los datos de proyectos y ejecuciones guardadas se almacenan en la base de datos (Supabase) con acceso restringido por Row Level Security (RLS) basado en el usuario autenticado.
- **IA y Privacidad**: La integración con modelos de IA (OpenAI, Groq) se realiza a través de sus APIs oficiales no-entrenables por defecto (Tier de pago/API), asegurando que los inputs del usuario no se utilicen para entrenar modelos públicos.
- **Opt-out de Entrenamiento**: Se ha verificado y confirmado que la opción de entrenamiento con datos de API está DESACTIVADA en los proveedores de IA utilizados.

## 4. Política de Retención de Datos

Se establece la siguiente política de retención para los datos procesados por WADI:

- **Logs de API**: Se mantienen por un periodo máximo de **90 días** para fines de debugging y monitoreo de seguridad. Pasado este tiempo, son eliminados o anonimizados.
- **Proyectos y Runs**: Se almacenan indefinidamente mientras la cuenta del usuario esté activa, para asegurar la disponibilidad del historial de trabajo.
- **Eliminación de Datos**:
  - El usuario puede eliminar proyectos individuales (y sus runs asociados) en cualquier momento mediante la API o UI.
  - Al eliminar un proyecto, los datos se borran permanentemente de la base de datos principal.
