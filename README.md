# Canada Pulse

Canada Pulse is a public Canadian economic-intelligence product that detects official releases, loads structured facts where available, and publishes source-backed national and provincial research briefs.

Production: [canadapulse.vercel.app](https://canadapulse.vercel.app)

## Live Sources

- Statistics Canada Daily feeds, direct release probes, and linked table downloads
- Bank of Canada Valet observations, reports, surveys, and policy publications
- CMHC housing-construction data
- Open Government Canada and IRCC dataset monitoring
- Canada Energy Regulator and NRCan publications
- CIHI National Health Expenditure Trends
- PBO source monitoring

Every public metric carries an evidence status. Missing province rows remain missing; the app does not infer zero or silently replace official data with a model.

## Local Development

```bash
npm install
npm run dev
```

The production product is intentionally stateless. It fetches official publishers at request time, uses short-lived Vercel caching for performance, and does not require or retain a historical database.

## Scheduled Refresh

Vercel cron invokes `/api/cron/refresh-data` at 15:00 and 16:00 UTC on weekdays. The pair guarantees one check at 11:00 a.m. Toronto time through both daylight-saving and standard-time seasons, with a second check one hour before or after. Production requires `CRON_SECRET`; Vercel sends it as a bearer token automatically.

The refresh performs:

1. Statistics Canada Daily detection and table extraction.
2. Multi-source release normalization and promotion scoring.
3. CIHI health-expenditure source refresh.
4. Source-cache invalidation so new official releases become visible promptly.

## Verification

```bash
npm run audit:public-data
npm run lint
npm run build
npx prisma validate
```

`audit:public-data` prevents seeded data modules from being imported by public routes and active components.

## Important Routes

- `/` latest promoted release and official debate board
- `/releases` searchable live official release feed
- `/pulse-release/[source]/[slug]` structured research brief
- `/compare` like-for-like province comparison
- `/province/[province]` verified province evidence
- `/data-status` live source and freshness status
- `/methodology` evidence and interpretation rules
