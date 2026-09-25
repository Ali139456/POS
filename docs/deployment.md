# Deployment

The demo deploys as a Next.js app on Vercel from the repository root.

Production data requires a Supabase project:

1. Create the project.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
3. Set `SUPABASE_SERVICE_ROLE_KEY` only as a server environment variable.
4. Apply `supabase/migrations` with `supabase db push`.

Enable daily database backups in the Supabase project. Offline browser data is a queue, not the financial record.
