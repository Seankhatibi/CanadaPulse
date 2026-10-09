# Canada Pulse: everyday-life release

Outcome: help Canadians understand changes in money, housing, work, services and government using dated official evidence and transparent scenarios.

Authorized scope: life-first homepage; contextual release stories; compact mobile navigation; accessible list/2D/3D explorer; move-out calculator and city comparison; age-specific jobs and wages; tuition, poverty, food insecurity and wellbeing series; official bill tracker; dataset register and freshness; chart integrity; year-independent source parsing; verified GitHub and hosting release.

Acceptance: public metrics have source/period/cohort; unlike units never share a quantitative scale; missing values stay missing; calculators distinguish user assumptions from observations; legislative progress never implies implementation; primary flows work on narrow screens and keyboard; lint, build and data-integrity checks pass.

Decisions: reuse existing stateless source ingestion and optional archive. Do not provision a new database or fabricate historical vintages. Query complete time series from official publishers; archive snapshots only where the existing database is configured. Keep budget inputs in browser state. Replace misleading tax rankings with editable take-home budgeting and official fiscal evidence.

Status: implemented and published to GitHub main and Vercel production. Production browser checks verified the homepage and editable move-out budget, including the shared-rent calculation. Runtime source availability and deployment are verified separately from code checks. Broader service-access datasets must show actual import availability, never generated estimates. Youth usability target (8/10 readers understanding the finding and limitation within two minutes) requires human testing after release.

Verification: all 10 curated Statistics Canada series loaded in the source check; 191 LEGISinfo records loaded. CMHC rental import returned 43 metros and 10 provinces with an October 2025 survey period and December 11, 2025 release date. Lint, TypeScript, production build, public-data provenance, persistence-policy and life-experience boundary checks passed. The comprehensive official release integrity audit also passed after retrying a transient source timeout.

Remaining coverage: direct imports of service wait times, detailed childcare costs, new-lease asking rents, municipal policy and program eligibility are not yet available. Publisher links and explicit coverage notices are provided. The policy tracker covers federal bills; it does not claim to verify implementation or outcomes. The interface is designed for the 2027 audience while retaining actual observation dates.

Final refinements: surface actual youth cohorts directly on Today; prioritize employment, inflation and rent before less actionable industry totals; improve light-card contrast when the shell uses dark mode; provide 44px navigation targets.

Map-first update: homepage opens in 3D with visible province badges; actual youth unemployment, youth wages and young-adult primary care are available alongside rent, vacancy, inflation and broader economic layers. Each cohort layer requires the same observation period across provinces. Missing values stay grey. Extrusion depth is decorative and fixed; colour has a layer-specific legend. List and 2D alternatives remain available.

Compatibility: WebGL rendering uses a raised, labelled vector fallback when a browser cannot create a graphics context. The fallback retains province selection, colour interpolation and keyboard access.
