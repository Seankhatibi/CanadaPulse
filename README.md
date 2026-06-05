# Canada Pulse

Canada Pulse is an interactive public dashboard for understanding Canada's economy, housing, population pressure, government spending, trade, energy, health, youth future, and quality of life.

Current milestone: Phase 2, with a Next.js app shell, mock data layer, Prisma/PostgreSQL schema, source registry, seed script, and data-model page.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

If port 3000 is busy, Next.js will automatically select the next available port.

## Phase 2 Data Commands

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

Copy `.env.example` to `.env` and set `DATABASE_URL` before pushing or seeding a real database. The app itself still runs on mock data without database credentials.

## Key Files

- `prisma/schema.prisma` defines the PostgreSQL-ready data model.
- `prisma/seed.ts` loads the mock dataset into Prisma.
- `src/lib/mock-data/` contains source-ready mock geographies, indicators, scores, and time-series rows.
- `src/lib/data/mock-queries.ts` is the app-facing mock query layer.
- `src/app/data-model/page.tsx` shows the Phase 2 data inventory.

## Verification

```bash
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

## Product Direction

The app should stay neutral, data-first, mobile-first, and built around the emotional indicators Canadians care about: affordability, housing, wages, immigration pressure, taxes, healthcare access, productivity, debt, energy, and whether young people can build a future.
