# Cómo instalar WADI en otra computadora 💻

¡Es muy fácil! Como el código está en GitHub, solo necesitas bajarlo y configurar las "llaves" secretas.

## 1. Prerrequisitos
Instala esto en la nueva PC antes de empezar:
1.  **Node.js (v20 o superior):** [Descargar aquí](https://nodejs.org/).
2.  **Git:** [Descargar aquí](https://git-scm.com/).
3.  **PNPM:** Abre la terminal (PowerShell o CMD) y escribe:
    ```bash
    npm install -g pnpm
    ```

## 2. Descargar el Proyecto
Abre una carpeta donde quieras trabajar, click derecho > "Open Terminal" (o Git Bash) y escribe:
```bash
git clone https://github.com/masosa96-hash/WADINEW.git
cd WADINEW/WADI
```

## 3. Instalar Dependencias
Para bajar todas las librerías del proyecto, ejecuta:
```bash
pnpm install
```

## 4. Configurar Secretos (¡IMPORTANTE! 🔐)
El archivo `.env` **NO se descarga** con git (por seguridad). Tienes que crearlo manualmente.

1.  Crea un archivo nuevo llamado `.env` en la carpeta raíz (`WADINEW/WADI`).
2.  Copia y pega el contenido de tu `.env` actual (el de tu PC original).
    *   *Tip:* Si no lo tienes a mano, puedes sacar los valores del Dashboard de Render o Supabase.

El archivo debe verse así (con tus valores reales):
```env
# Backend
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://tu-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-clave-larga
OPENAI_API_KEY=tu-clave-openai
GROQ_API_KEY=tu-clave-groq

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://tu-url.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

## 5. ¡A trabajar! 🚀
Arranca el entorno de desarrollo con:
```bash
pnpm dev
```
Verás que se abren dos cosas:
- **API:** http://localhost:3000
- **Web:** http://localhost:5173

¡Y listo! Todo lo que hagas y hagas `git push` se guardará en la nube.
