# Radar PropTech

Plataforma SaaS PropTech con panel de control construida sobre Next.js App Router, React y Tailwind CSS.

## Run & Operate

- `pnpm --filter @workspace/radar-proptech run dev` — Next.js dev server (puerto 19946)
- `pnpm --filter @workspace/api-server run dev` — API server Express (puerto 5000)
- `pnpm run typecheck` — typecheck completo en todos los paquetes
- `pnpm run build` — typecheck + build todos los paquetes
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks y schemas Zod desde OpenAPI
- `pnpm --filter @workspace/db run push` — aplicar cambios de schema en DB (solo dev)
- Required env: `DATABASE_URL` — string de conexión Postgres
- Required env (cuando se active Supabase): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS v3
- Auth/DB externa: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Iconos: lucide-react
- API interna: Express 5
- DB interna: PostgreSQL + Drizzle ORM
- Validación: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (desde OpenAPI spec)
- Build: esbuild (CJS bundle) para API server

## Where things live

- `artifacts/radar-proptech/` — app Next.js principal
  - `app/` — rutas y layouts (App Router)
  - `app/page.tsx` — página de inicio (Panel de Control)
  - `app/layout.tsx` — layout raíz con metadatos
  - `app/globals.css` — estilos globales Tailwind
  - `utils/supabase/client.ts` — cliente Supabase para el browser
  - `components/` — componentes UI reutilizables (vacía, lista para usar)
- `artifacts/api-server/` — API Express compartida
- `lib/api-spec/openapi.yaml` — contrato OpenAPI (fuente de verdad)
- `lib/db/src/schema/` — esquema Drizzle ORM

## Architecture decisions

- Next.js App Router sobre Pages Router para server components y mejor DX.
- `@supabase/ssr` para manejo correcto de cookies en server/client components de Next.js.
- Cliente Supabase creado con factory function (`createClient()`) para evitar instancias singleton en edge/server.
- Tailwind CSS v3 (compatible con postcss.config.mjs estándar de Next.js).
- El API server Express coexiste con Next.js para lógica de negocio interna.

## Product

Panel de control SaaS PropTech. La página de inicio muestra "Radar PropTech - Panel de Control". La carpeta `components/` está preparada para futuros componentes de UI.

## User preferences

- Proyecto en español.
- Stack: Next.js App Router + React + Tailwind CSS + Supabase.

## Gotchas

- El cliente Supabase en `utils/supabase/client.ts` requiere `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuradas antes de usarlo.
- Para server components, crear un cliente server-side con `createServerClient` de `@supabase/ssr`.
- Next.js usa `--port` flag; el PORT lo inyecta el workflow vía `services.env.PORT = "19946"`.

## Pointers

- Ver skill `pnpm-workspace` para estructura del workspace, configuración TypeScript y detalles de paquetes.
