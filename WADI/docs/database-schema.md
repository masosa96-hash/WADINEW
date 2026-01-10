# Database Schema Design (Supabase)

## Tables

### `profiles`
Stores user profile information, linked to Supabase Auth.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | UUID | PK, FK -> auth.users.id | Links to Supabase Auth user |
| `display_name` | TEXT | | User's display name |
| `efficiency_points` | INT4 | Default 0 | Gamification points (legacy WADI) |
| `efficiency_rank` | TEXT | | Gamification rank (legacy WADI) |
| `created_at` | TIMESTAMPTZ | Default NOW() | Creation timestamp |

### `projects`
Stores user projects.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, Default gen_random_uuid() | Unique Project ID |
| `user_id` | UUID | FK -> profiles.user_id | Owner of the project |
| `name` | TEXT | NOT NULL | Project Name |
| `description` | TEXT | | Project Description |
| `status` | TEXT | Default 'PLANNING' | Project Status (PLANNING, IN_PROGRESS, etc.) |
| `created_at` | TIMESTAMPTZ | Default NOW() | Creation timestamp |

### `runs`
Stores AI execution runs within a project.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, Default gen_random_uuid() | Unique Run ID |
| `project_id` | UUID | FK -> projects.id | Parent Project |
| `user_id` | UUID | FK -> profiles.user_id | Run Executor |
| `input` | TEXT | NOT NULL | User Input / Prompt |
| `output` | TEXT | | AI Response |
| `model` | TEXT | Default 'gpt-3.5-turbo' | AI Model Used |
| `created_at` | TIMESTAMPTZ | Default NOW() | Creation timestamp |

## Relationships

- `profiles.user_id` -> `auth.users.id` (1:1)
- `projects.user_id` -> `profiles.user_id` (N:1)
- `runs.project_id` -> `projects.id` (N:1)
- `runs.user_id` -> `profiles.user_id` (N:1)

## Row Level Security (RLS)

- **profiles**: Users can `SELECT` and `UPDATE` their own profile (`auth.uid() = user_id`).
- **projects**: Users can `ALL` on their own projects (`auth.uid() = user_id`).
- **runs**: Users can `ALL` on their own runs (`auth.uid() = user_id`).
