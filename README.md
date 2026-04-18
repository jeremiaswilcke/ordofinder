# Ordofinder

Ordofinder is a city-first global archive for discovering Catholic churches, worthy celebrations, trusted liturgical signals and living parish culture.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v3 with Stitch / Material 3 tokens
- next-intl (`en`, `de`)
- Supabase (schema, invites, moderation groundwork)
- Leaflet + OpenStreetMap

## Local Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a local `.env.local` when you are ready to wire Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Without those variables, the app falls back to the seeded in-repo archive demo data.

## Supabase Setup

Local project files are already initialized. Typical local flow:

```bash
pnpm supabase:start
pnpm supabase:reset
```

To connect a real hosted project:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Then copy your hosted project values into `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional type generation after schema changes:

```bash
pnpm supabase:types
```

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Database

Supabase migrations live in `supabase/migrations`.

Current schema includes:

- churches, mass times, ratings
- reviewer regions
- invite tokens
- church submissions
- reports and approval events

## Deploy

The repository is prepared for Git-based Vercel deployment. After importing the GitHub repo into Vercel, set the Supabase environment variables in the project settings.
