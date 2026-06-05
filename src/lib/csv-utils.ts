export function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.replace(/^\uFEFF/, "").trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.replace(/^\uFEFF/, "").trim());
  return cells;
}

export function parseCsv(csv: string) {
  return csv
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map(parseCsvLine);
}
