# Supabase + React (Vite + TypeScript) Learning Project

## One‑liner Summary
Built a TypeScript React app with Supabase (DB, RLS, Edge Functions, Tailwind, multi‑env) and local Docker Postgres, demonstrating full stack basics.

---
## 1. Goals
- Learn how to scaffold a modern React + TypeScript frontend.
- Connect securely to a Supabase Postgres database.
- Practice schema creation, RLS (Row Level Security) policies, and CRUD.
- Integrate Tailwind CSS for rapid UI styling.
- Separate local vs production configuration (.env management).
- Explore Supabase Edge Functions (Deno) for server-side logic.
- Interact directly with the local Postgres via psql, Docker, and pgAdmin.

## 2. Stack Overview
| Layer | Tooling | Notes |
|-------|---------|-------|
| Frontend | React 18 + Vite + TypeScript | Fast dev server, import.meta.env for env vars |
| Styling | Tailwind CSS v4 | Uses `@tailwindcss/postcss` plugin |
| Backend Services | Supabase (Auth, Postgres, Storage, Edge Functions) | Hosted + local Docker stack |
| Database | Postgres (Supabase managed + local container) | RLS enabled |
| Serverless Logic | Supabase Edge Functions (Deno) | Optional JWT auth pass-through |
| Tooling | Supabase CLI, Docker | Local development environment |

## 3. Project Structure (key parts)
```
my-supabase-app/
  EDGE_FUNCTIONS.md         # Edge function documentation and notes
  eslint.config.js          # ESLint configuration for code linting
  index.html                # Main HTML entry for Vite app
  package.json              # NPM dependencies and scripts
  postcss.config.js         # PostCSS config for Tailwind and CSS transforms
  README.md                 # Project overview and instructions
  tailwind.config.js        # Tailwind CSS configuration
  tsconfig.app.json         # TypeScript config for app source
  tsconfig.json             # Root TypeScript configuration
  tsconfig.node.json        # TypeScript config for Node scripts
  vite.config.ts            # Vite build and dev server configuration
  docs/
    PROJECT_OVERVIEW.md     # Main project documentation
  public/
    vite.svg                # Public asset example
  src/
    App.css                 # App component styles
    App.tsx                 # Main React app component
    index.css                # Global styles
    main.tsx                # App entry point
    vite-env.d.ts           # Vite environment type definitions
    assets/
      react.svg             # React logo asset
  supabase/
    client.ts               # Supabase JS client setup
    config.toml             # Supabase local project config
    functions/
      myFirstFunction/
        deno.json           # Deno runtime config for edge function
        index.ts            # Edge function source code
      profile-summary/
        index.ts            # Another edge function source code
    migrations/
      <timestamp>_create_profiles_table.sql # Database migration file
  .env.development          # Local environment variables
  .env.production           # Production environment variables
  .env.example              # Example environment variables
```

## 4. Environment Management
- `.env.development`: local stack (http://localhost:54321 + local anon key).
- `.env.production`: hosted project (https://<project-ref>.supabase.co + hosted anon key).
- `VITE_` prefix exposes only safe public vars to the browser.
- Service role key NEVER stored in frontend env files.

## 5. Supabase Client
```ts
// supabase/client.ts
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);
export default supabase;
```

## 6. Database & RLS
- Created `profiles` table (UUID primary key, metadata columns).
Enabled RLS (default with Supabase) and added policies for authenticated CRUD.
For edge functions to work, you must create both INSERT and SELECT policies. Example patterns:
```sql
-- Allow inserts for all roles
CREATE POLICY "Allow insert for all" ON public.profiles
FOR INSERT
TO public
WITH CHECK (true);

-- Allow selects for all roles
CREATE POLICY "Allow select for all" ON public.profiles
FOR SELECT
TO public
USING (true);
```
You can tighten further using `auth.uid() = id` style predicates or restrict to authenticated users only.

## 7. Tailwind Integration (v4)
- Added `@tailwindcss/postcss` in `postcss.config.js`.
- Used utility classes for responsive table layout.
- `content` paths in `tailwind.config.js` include `index.html` & `src/**/*`.

## 8. Data Fetching UI (App.tsx)
- On mount: `supabase.from('profiles').select('*')`.
- Renders dynamic table headers/rows with Tailwind classes.
- Handles loading + basic error logging.

## 9. Edge Function (Deno)
### Supabase CLI Login & Local Workflow
To work with Supabase locally, you need to log in to the CLI and link your project:

1. **Login to Supabase CLI:**
  ```powershell
  supabase login
  ```
  - This opens a browser window for authentication. Enter the verification code in your terminal.

2. **Link your project:**
  ```powershell
  supabase link
  ```
  - This associates your local folder with a Supabase project ref.

3. **Apply migrations to local database:**
  ```powershell
  supabase db push --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
  ```
  - This command applies your migration files to your local Postgres instance.

4. **Serve edge functions locally:**
  ```powershell
  supabase functions serve myFirstFunction
  ```
  - This makes your edge function available at `http://127.0.0.1:54321/functions/v1/myFirstFunction`.

**Summary:**
- Always log in to the CLI before linking or pushing migrations.
- Use the `--db-url` flag to target your local database.
- Keep the serve terminal open to test edge functions locally.

### Serving Edge Functions Locally
To serve an edge function locally, you must run:
```powershell
supabase functions serve myFirstFunction
```
This command starts a local server for your function. The terminal must remain open for the function to be accessible at `http://127.0.0.1:54321/functions/v1/myFirstFunction`.

**Note:**
- If you previously started the serve command and did not stop it, the process may still be running in the background, allowing you to receive responses.
- Supabase local containers (started with `supabase start`) run several services, but edge functions are only served when you run the serve command.
- If you deploy the function (`supabase functions deploy myFirstFunction`), it will be available from the remote Supabase project.

Always ensure the serve process is running in your terminal for local development and testing of edge functions.
- Scaffolded `myFirstFunction` for custom server-side logic.
- Two auth strategies explored:
  1. Service role key (secure backend only, bypasses RLS).
  2. Pass user JWT via `Authorization` header + anon key client to preserve RLS.

**Local testing steps:**
1. Start Supabase containers: `supabase start`
2. Serve the function: `supabase functions serve myFirstFunction`
3. Call the function using curl or similar, passing the anon key as JWT:
   ```powershell
   curl.exe -i --location --request POST "http://127.0.0.1:54321/functions/v1/myFirstFunction" --header "Authorization: Bearer <anon-key>" --header "Content-Type: application/json" --data '{"name":"Functions"}'
   ```
   - The anon key can be found in the output of `supabase status`.
   - For authenticated requests, use a JWT from Supabase Auth (see Supabase docs).

**Note:** The JWT secret shown in `supabase status` is not a valid token for requests; use the anon key or a real user JWT.

Edge function code example:
```typescript
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)
```
Environment variables are injected by the Supabase CLI when serving functions locally.

## 10. Local Postgres Access
Methods:
1. `docker exec -it <db_container> psql -U postgres -d postgres` (no password inside container).
2. Host psql:
   ```powershell
   $env:PGPASSWORD="<local_password>"
   psql -h 127.0.0.1 -p 54322 -U postgres -d postgres
   ```
3. GUI (pgAdmin / DBeaver): host `127.0.0.1`, port `54322`, SSL disabled.
4. Connection URL: `postgresql://postgres:<password>@127.0.0.1:54322/postgres`.

## 11. Migrations Workflow
```bash
supabase migration new add_status_to_profiles
# edit SQL file
supabase db push
```
- `supabase db diff -f <file>` to capture drift from remote.
- Commit migration files for reproducibility.

## 12. Useful SQL Snippets
```sql
-- Inspect table
\d profiles
-- List policies
SELECT policyname, permissive, roles, qual, with_check FROM pg_policies WHERE tablename='profiles';
-- Count rows
SELECT COUNT(*) FROM profiles;
-- Add index example
CREATE INDEX IF NOT EXISTS profiles_website_idx ON public.profiles (website);
```

## 13. Security Practices
- Never expose service role key to browser.
- Restrict CRUD with RLS (authenticated role + row ownership where appropriate).
- Use migrations for schema changes—not ad-hoc manual edits only.
- Separate local/production env files; avoid committing secrets.

## 14. Troubleshooting Highlights
| Issue | Cause | Fix |
|-------|-------|-----|
| 401 selecting table | Missing/strict RLS | Add/adjust policy or use authenticated session |
| Tailwind not applying | Missing v4 plugin | Add `@tailwindcss/postcss` plugin | 
| Port mismatch | Dev server fallback | Set `strictPort: true` in `vite.config.ts` |
| Missing psql | CLI not installed | Install via Scoop/Winget or use docker exec |
| Auth header missing in function | Caller not sending JWT | Forward `Authorization: Bearer <token>` |

## 15. Next Potential Enhancements
- Add auth UI (sign-in / sign-up) and display user-specific data.
- Implement insert/update/delete forms with optimistic UI.
- Real-time subscriptions (`supabase.channel`).
- Generate typed DB definitions: `supabase gen types typescript`.
- Refactor queries into a dedicated data service layer.
- Add Jest/Vitest tests for critical data functions.
- Deploy and monitor Edge Function logs.

## 16. High-Level Flow Diagram (conceptual)
```
Browser (React + Supabase JS) --> Supabase REST/PostgREST --> Postgres (RLS) --> Data
                         \
                          --> Edge Function (Deno) --> Postgres (service / anon)
```

## 17. One-Page Pitch (for non-technical stakeholders)
We built a modern demo stack combining a React TypeScript front-end styled with Tailwind and a Supabase backend (managed Postgres + Auth + serverless functions). It showcases secure data access via row-level security, environment isolation for local vs production, and an extendable path to backend logic using Edge Functions—all reproducible through migrations and containerized local development.

---
_Last updated: 2025-08-12_
