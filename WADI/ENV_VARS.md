# Environment Variables

## Backend (`apps/api`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | API Server Port | `3000` |
| `SUPABASE_URL` | **Yes** | Supabase Project URL | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase Service Role Key (Server-side only) | `eyJ...` |
| `OPENAI_API_KEY` | **Yes** | OpenAI API Key (or Groq Key if using Groq) | `sk-...` |
| `GROQ_API_KEY` | No | Groq API Key (Overrides OpenAI if present) | `gsk_...` |
| `GROQ_MODEL` | No | Groq Model ID | `llama-3.1-8b-instant` |
| `NODE_ENV` | No | Environment (development/production) | `development` |

## Frontend (`apps/frontend`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_SUPABASE_URL` | **Yes** | Supabase Project URL (Must watch API) | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | Supabase Anon Key (Public) | `eyJ...` |
| `VITE_API_URL` | No | URL of the WADI Backend API | `http://localhost:3000/api` |

## Deployment (Render)

When deploying to Render, you must manually add the following Environment Variables in the Render Dashboard:

1.  `SUPABASE_URL`
2.  `SUPABASE_SERVICE_ROLE_KEY`
3.  `OPENAI_API_KEY` (or `GROQ_API_KEY`)
4.  `NODE_VERSION` (Recommended: `20`)
