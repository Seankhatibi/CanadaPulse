import { inflateRawSync } from "node:zlib";
import { fetchStatCanFullTableDownloadCsv } from "@/lib/etl/statcan-adapter";

function findEndOfCentralDirectory(buffer: Buffer) {
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }

  throw new Error("ZIP central directory not found.");
}

function extractCsvFromZip(buffer: Buffer, preferredName: string) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  let centralOffset = buffer.readUInt32LE(eocdOffset + 16);

  for (let entry = 0; entry < entryCount; entry += 1) {
    if (buffer.readUInt32LE(centralOffset) !== 0x02014b50) {
      throw new Error("Invalid ZIP central directory entry.");
    }

    const compressionMethod = buffer.readUInt16LE(centralOffset + 10);
    const compressedSize = buffer.readUInt32LE(centralOffset + 20);
    const fileNameLength = buffer.readUInt16LE(centralOffset + 28);
    const extraLength = buffer.readUInt16LE(centralOffset + 30);
    const commentLength = buffer.readUInt16LE(centralOffset + 32);
    const localHeaderOffset = buffer.readUInt32LE(centralOffset + 42);
    const fileName = buffer.toString("utf8", centralOffset + 46, centralOffset + 46 + fileNameLength);
    const isTargetCsv = fileName === preferredName || (fileName.endsWith(".csv") && !fileName.includes("MetaData"));

    if (isTargetCsv) {
      if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
        throw new Error("Invalid ZIP local file header.");
      }

      const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
      const bytes = compressionMethod === 0 ? compressed : inflateRawSync(compressed);
      return bytes.toString("utf8").replace(/^\uFEFF/, "");
    }

    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  throw new Error(`CSV ${preferredName} not found in ZIP.`);
}

export async function fetchStatCanTableCsv(productId: string) {
  const response = (await fetchStatCanFullTableDownloadCsv(productId)) as {
    status?: string;
    object?: string;
    message?: string;
  };

  if (response.status !== "SUCCESS" || !response.object) {
    throw new Error(response.message ?? `StatCan table download unavailable for ${productId}`);
  }

  const zipResponse = await fetch(response.object, {
    headers: { "User-Agent": "Canada Pulse official table importer" },
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!zipResponse.ok) {
    throw new Error(`StatCan table ZIP fetch failed for ${productId}: ${zipResponse.status}`);
  }

  return {
    csv: extractCsvFromZip(Buffer.from(await zipResponse.arrayBuffer()), `${productId}.csv`),
    downloadUrl: response.object,
  };
}
