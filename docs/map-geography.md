# Canada map geography

Both the SVG fallback and WebGL map use `src/lib/canada-boundaries.json`, derived from Statistics Canada's 2021 province and territory **cartographic** boundary service:

https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer/0

The source uses EPSG:3347 (NAD83 / Statistics Canada Lambert). We retain this projection and normalize all coordinates with one uniform scale and a Y-axis flip. Provinces and territories are never individually resized or repositioned. This replaces the former third-party map's tall projection. The Great Lakes, Hudson Bay and Arctic archipelago come from the boundary geometry, not hand-drawn shapes.

To regenerate, save one ArcGIS query response per PRUID as `statcan-<PRUID>.json` in a temporary directory. Query parameters: `where=PRUID IN ('<PRUID>')`, `outFields=PRUID,PRENAME`, `returnGeometry=true`, `maxAllowableOffset=1500`, `f=pjson`. Run `python scripts/generate-canada-boundaries.py --input-dir <directory>`.

This is display cartography, not survey geometry: the service generalizes coastlines to a 1,500-metre tolerance, coordinates are rounded to two SVG decimals, and rings occupying less than 0.05 square screen pixels at 500px width are omitted. All 13 provinces and territories remain present. Geographic boundaries have a 2021 reference year; indicator dates are independent and shown on each data layer.

Attribution: Government of Canada; Statistics Canada; Statistical Geomatics Centre. Distributed under the [Open Government Licence – Canada](https://open.canada.ca/en/open-government-licence-canada).

The 3D tilt and raised edges are presentation effects, not terrain elevation or data height. The 2D view retains the un-tilted geographic projection. WebGL uses dynamic imports and the vector fallback uses precomputed label anchors, avoiding DOM measurement and repeated layout work.
