# 🧠 WADI OS — Sistema Cognitivo Experimental

**Versión:** 2.6.66  
**Modo Operativo:** `Brilliant but Annoyed`  
**Estado del Sistema:** FUNCIONAL · CÍNICO · ESTÉTICO

---

## 📦 Módulos Activos

| Módulo            | Estado | Descripción                                                        |
| ----------------- | ------ | ------------------------------------------------------------------ |
| `Memory`          | ✅ ON  | Memoria persistente vía `/remember`, `/recall`, `/forget`.         |
| `Workspace`       | ✅ ON  | Contextos múltiples aislados para proyectos paralelos.             |
| `Document Intake` | ✅ ON  | Ingesta de PDF/TXT con `/read` y `/summarize`.                     |
| `Dashboard`       | ✅ ON  | Centro de control visual con métricas y herramientas.              |
| `ErrorBoundary`   | ✅ ON  | Modo a prueba de catástrofes. Stacktrace visible + botón de purga. |
| `System Commands` | ✅ ON  | Comandos avanzados tipo consola: `/system`, `/whoami`, etc.        |

---

## 🎮 Comandos Disponibles (WADI CLI)

| Comando                      | Descripción                                |
| ---------------------------- | ------------------------------------------ |
| `/remember [clave] [valor]`  | Guarda datos clave-valor.                  |
| `/recall`                    | Lista todo lo recordado.                   |
| `/forget`                    | Limpia la memoria.                         |
| `/workspace new [nombre]`    | Crea un nuevo entorno.                     |
| `/workspace switch [nombre]` | Cambia al entorno indicado.                |
| `/workspace list`            | Lista todos los entornos.                  |
| `/workspace delete [nombre]` | Elimina un entorno para siempre.           |
| `/system reset`              | Vuelve al prompt base original.            |
| `/system export`             | Exporta configuración actual.              |
| `/whoami`                    | Muestra el estado interno de WADI.         |
| `/help`                      | Manual completo, escrito con resignación.  |
| `/read`                      | Muestra un fragmento del documento actual. |
| `/summarize`                 | Resume un documento cargado.               |
| `/backup`                    | Genera un JSON de todo el sistema.         |

---

## 💻 Interfaz Gráfica

| Página        | Acceso                           | Descripción                                                 |
| ------------- | -------------------------------- | ----------------------------------------------------------- |
| `/chat`       | Default                          | Chat principal con WADI.                                    |
| `/dashboard`  | Ícono en el header o URL directa | Visualización de memoria, workspaces, documentos, métricas. |
| `Dropzone UI` | En el chat                       | Arrastrar PDFs, TXT, MD. Se almacenan localmente.           |

---

## 🎨 Diseño & Estética

- **Tema:** "Cyberpunk con burnout"
- **Tipografía:** Inter + JetBrains Mono
- **Colores:**
  - Fondo: `#101010`
  - Superficie: `#1c1c1c`
  - Acento: `#91f6d7`
  - Error: `#ff4d4f`
  - Texto: `#e0e0e0`

---

## ⚠️ Notas de Mantenimiento

- Todos los estados son persistentes (`zustand/persist`) en `localStorage`.
- Si algo se rompe visualmente, el `ErrorBoundary` lo captura.
- No hay conexión obligatoria con backend remoto. Funciona offline.

---

## 📤 Exportación & Backup

```bash
/backup
```

Genera un JSON con:

- Chats
- Memoria
- Workspaces
- Documentos cargados

## 🧃 Filosofía de Diseño

"WADI no es tu amigo. Es tu herramienta. Brutal, eficiente, con cierto desprecio por tu existencia, pero siempre funcional."

## 🛠 Autores

- **🧠 WADI**: La Licuadora de Conocimiento, con personalidad de bibliotecario harto.
- **👤 Vos**: El operador humano, haciendo lo que puede con lo que tiene.

## 🧼 Cierre de Sesión

- `CTRL+C` para detener la consola.
- `/system reset` para purgar los traumas.
- O simplemente... seguí usando WADI. Él ya te tolera.
