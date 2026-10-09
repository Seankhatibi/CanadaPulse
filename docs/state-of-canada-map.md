# State of Canada map

The homepage map is a cross-topic explorer. It combines the existing release hub, Parliament's LEGISinfo feed and the existing Statistics Canada life series. Seven lenses cover the economy, housing, society, immigration, government, trade and energy/future. The source-specific layer selector includes reports and parliamentary updates without assigning invented numeric scores.

## Opening view and refresh

`buildStateOfCanadaMap` chooses the newest verified numeric release by **publication date**. A newer GDP release overrides an older, higher-priority jobs release. Same-day ties use editorial importance, then youth relevance, then a stable ID; source records currently supply day-level publication dates, so the app does not claim intraday ordering. Archived fallback releases and errored sources cannot win the opening view.

The clean homepage URL follows this default. Selecting a layer pins it through `topic`; choosing “Latest update” removes that pin. Server refreshes re-derive the automatic selection from the new payload. The visible homepage requests refresh every ten minutes and checks again when returning from a hidden tab after ten minutes. This uses the existing release hub's ten-minute cache and source cadences; it does not claim instant delivery. Existing authenticated morning refresh jobs continue to expire caches. Observation periods and publication dates remain separate.

## Geography and interpretation

Existing single-measure province mappings can colour the official Canada boundaries. National or source-specific releases instead use a uniform Canada-level context view and keep `values` empty. A GDP total, industry series, report or bill status is never copied into each province. Supporting national metrics are individual cards, without a shared comparative scale. Detailed source coverage and complete tables remain available through the release link.

Political views show the latest recorded event, bill number, official status and completed stage. Royal assent is not labelled implementation. Title-based discovery does not claim the bill's actual effects or political sentiment.

Social layers add mental health, community belonging, poverty, food insecurity and life satisfaction; economy adds tuition. Province observations must match the latest national period. Missing, unreliable and suppressed source points remain absent. Percentages use “out of 100” explanations with the actual population; raw immigration and construction counts explicitly retain their denominators and scope limitations.

Period changes are calculated only when the exact preceding month, quarter or year is supplied in the same series. Missing preceding points do not become zero change. Annual/occasional health series do not receive derived period changes across potential survey redesigns. No cross-indicator socioeconomic score is invented.

Validation: `npm run audit:life-experience` covers newer GDP selection, date distinctions, national scope, archive/error exclusion, actual parliamentary stages, missing observations, zero values and comparison periods. Production compilation, lint and rendered topic interactions are also checked.
