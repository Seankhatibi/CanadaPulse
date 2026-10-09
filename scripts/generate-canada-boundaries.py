"""Generate display geometry from Statistics Canada's cartographic boundaries.

Run with --input-dir pointing to cached ArcGIS JSON responses named statcan-<PRUID>.json.
Coordinates stay in EPSG:3347; one uniform scale and a Y flip convert metres to SVG.
No province is resized, repositioned or detached. Subpixel rings are omitted.
"""
import argparse
import json
from pathlib import Path

SOURCE = "https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer/0"
CODES = {"10": "nl", "11": "pe", "12": "ns", "13": "nb", "24": "qc", "35": "on", "46": "mb", "47": "sk", "48": "ab", "59": "bc", "60": "yt", "61": "nt", "62": "nu"}
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--input-dir", type=Path, required=True)
args = parser.parse_args()
features = []
for code in CODES:
    features.extend(json.loads((args.input_dir / f"statcan-{code}.json").read_text())["features"])
assert len(features) == 13
points = [p for f in features for ring in f["geometry"]["rings"] for p in ring]
xmin, xmax = min(p[0] for p in points), max(p[0] for p in points)
ymin, ymax = min(p[1] for p in points), max(p[1] for p in points)
scale = 1000 / (xmax - xmin)
height = (ymax - ymin) * scale
locations = []
for f in features:
    paths = []
    largest = (0, None)
    for ring in f["geometry"]["rings"]:
        coords = [((x - xmin) * scale, (ymax - y) * scale) for x, y in ring]
        area = abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(coords, coords[1:]))) / 2
        if area < 0.2:  # Less than 0.05 px² at a 500px map width.
            continue
        if area > largest[0]:
            largest = (area, {"x": round((min(p[0] for p in coords) + max(p[0] for p in coords)) / 2, 2), "y": round((min(p[1] for p in coords) + max(p[1] for p in coords)) / 2, 2)})
        paths.append("M" + "L".join(f"{x:.2f},{y:.2f}" for x, y in coords[:-1]) + "Z")
    assert paths and largest[1]
    locations.append({"id": CODES[f["attributes"]["PRUID"]], "name": f["attributes"]["PRENAME"], "path": "".join(paths), "labelAnchor": largest[1]})
result = {"viewBox": f"0 0 1000 {height:.2f}", "width": 1000, "height": round(height, 2), "sourceUrl": SOURCE, "projection": "EPSG:3347 — NAD83 / Statistics Canada Lambert", "boundaryYear": 2021, "license": "Open Government Licence – Canada", "displayGeneralizationMetres": 1500, "locations": locations}
output = Path(__file__).resolve().parents[1] / "src/lib/canada-boundaries.json"
output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n")
print(f"Generated {len(locations)} provinces and territories; {output.stat().st_size:,} bytes; viewBox {result['viewBox']}")
