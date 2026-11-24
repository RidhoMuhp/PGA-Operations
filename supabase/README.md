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

`netlify.toml` configures the Next.js build only; it does not make a deploy preview private. The API is disabled outside local development and Netlify Deploy Previews. Before adding the two server environment variables to Netlify, enable Netlify's visitor-access protection for deploy previews in the site's dashboard. Do not deploy this service-role-backed API to a public site: the app does not yet have user authentication or authorization.

Keep the Supabase project on staging for this phase, and do not commit `.env.local` or copy the service-role key into client-side variables.
