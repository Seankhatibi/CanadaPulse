import { unzipSync } from "fflate";

export type WorkbookSheet = {
  name: string;
  rows: Array<Array<string | number | null>>;
};

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function text(bytes: Uint8Array | undefined) {
  return bytes ? new TextDecoder().decode(bytes) : "";
}

function sharedStrings(xml: string) {
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
    decodeXml([...match[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((part) => part[1]).join("")),
  );
}

function columnIndex(reference: string) {
  const letters = reference.match(/^[A-Z]+/i)?.[0].toUpperCase() ?? "A";
  return [...letters].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function parseSheet(xml: string, strings: string[]) {
  return [...xml.matchAll(/<row(?:\s[^>]*)?>([\s\S]*?)<\/row>/g)].map((rowMatch) => {
    const row: Array<string | number | null> = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attributes = cellMatch[1];
      const body = cellMatch[2] ?? "";
      const reference = attributes.match(/\br="([A-Z]+\d+)"/i)?.[1] ?? "A1";
      const type = attributes.match(/\bt="([^"]+)"/)?.[1];
      const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      const inline = body.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/)?.[1];
      let value: string | number | null = null;
      if (type === "s" && raw !== undefined) value = strings[Number(raw)] ?? "";
      else if ((type === "inlineStr" || type === "str") && inline !== undefined) value = decodeXml(inline);
      else if (raw !== undefined && raw !== "") value = Number.isFinite(Number(raw)) ? Number(raw) : decodeXml(raw);
      row[columnIndex(reference)] = value;
    }
    return row;
  });
}

export function readWorkbook(buffer: ArrayBuffer): WorkbookSheet[] {
  const files = unzipSync(new Uint8Array(buffer));
  const workbookXml = text(files["xl/workbook.xml"]);
  const relationshipXml = text(files["xl/_rels/workbook.xml.rels"]);
  const strings = sharedStrings(text(files["xl/sharedStrings.xml"]));
  const relationships = new Map(
    [...relationshipXml.matchAll(/<Relationship\s([^>]+)\/?>(?:<\/Relationship>)?/g)].map((match) => {
      const id = match[1].match(/\bId="([^"]+)"/)?.[1] ?? "";
      const target = match[1].match(/\bTarget="([^"]+)"/)?.[1] ?? "";
      return [id, target] as const;
    }),
  );

  return [...workbookXml.matchAll(/<sheet\s([^>]+)\/?>(?:<\/sheet>)?/g)].flatMap((match) => {
    const name = decodeXml(match[1].match(/\bname="([^"]+)"/)?.[1] ?? "Sheet");
    const relationshipId = match[1].match(/\br:id="([^"]+)"/)?.[1] ?? "";
    const target = relationships.get(relationshipId);
    if (!target) return [];
    const normalizedTarget = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`;
    const sheetXml = text(files[normalizedTarget]);
    return sheetXml ? [{ name, rows: parseSheet(sheetXml, strings) }] : [];
  });
}
