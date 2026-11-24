# PGA Operations with Supabase staging

The application reads and writes operational data through Next.js Route Handlers. The Supabase service-role key is used only on the server and must never be exposed with a `NEXT_PUBLIC_` variable.

## Database

The staging migration was applied to create the `operations_*` tables, indexes, RLS policies, and demo employee/terminal rows. Do not rerun or modify it against a production project without reviewing the SQL first.

The app uses these tables:

- `operations_employees` and `operations_attendance_terminals` for the registry
- `operations_attendance_records` for terminal scans
- `operations_reports` for production/operational reports and approval status

Attendance duplicate prevention is enforced by a database unique index per employee, production type, terminal, and daily terminal session. Reports retain the existing thread-usage and used-material form data in their `payload`.

## Local development

Configure these server environment variables in the ignored `.env.local` file:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Then run `npm run dev`. The app loads data from `GET /api/operations`; scan, report, and approval changes use the corresponding `/api/operations/*` routes. Connection or database errors are shown in the UI and are not replaced with mock data.

## Netlify preview safety

`netlify.toml` configures the Next.js build only; it does not protect a site. The API is enabled locally during development. For Netlify Deploy Previews, set `OPERATIONS_API_ALLOW_DEPLOY_PREVIEW=true` in the **Deploy Previews** context. To test on the production deploy, first protect **all deploys including production** with Netlify site password protection or team login, keep the Supabase variables pointed at staging, then set `OPERATIONS_API_ALLOW_PROTECTED_PRODUCTION=true` in the **Production** context. Both variables need the **Functions** scope. Netlify's `CONTEXT`/`NETLIFY` build variables are not available to serverless functions at runtime, so the app uses explicit context-specific flags instead.

The app does not have its own user authentication or authorization. Do not enable the production flag or expose this service-role-backed API on a public site. Ensure Netlify's access protection covers API requests as well as pages.

Keep the Supabase project on staging for this phase, and do not commit `.env.local` or copy the service-role key into client-side variables.
