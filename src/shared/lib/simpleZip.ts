// Простой и надежный упаковщик ZIP без внешних зависимостей (метод Store, UTF-8)

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

export function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileInput {
  name: string; // e.g. "data/world_matrix.json"
  content: string | Uint8Array;
}

export function createZipArchive(files: ZipFileInput[]): Blob {
  const encoder = new TextEncoder();
  const fileEntries: Array<{
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    offset: number;
  }> = [];

  const localParts: Uint8Array[] = [];
  let currentOffset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name.replace(/\\/g, '/').replace(/^\//, ''));
    const dataBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const fileCrc = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true);         // Version needed
    view.setUint16(6, 0x0800, true);     // General purpose bit flag (UTF-8)
    view.setUint16(8, 0, true);          // Compression method = 0 (Store)
    view.setUint16(10, 0, true);         // Mod time
    view.setUint16(12, 0x5421, true);    // Mod date
    view.setUint32(14, fileCrc, true);   // CRC-32
    view.setUint32(18, dataBytes.length, true); // Compressed size
    view.setUint32(22, dataBytes.length, true); // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // File name length
    view.setUint16(28, 0, true);         // Extra field length

    localHeader.set(nameBytes, 30);

    fileEntries.push({
      nameBytes,
      dataBytes,
      crc: fileCrc,
      offset: currentOffset
    });

    localParts.push(localHeader);
    localParts.push(dataBytes);

    currentOffset += localHeader.length + dataBytes.length;
  }

  const centralDirStart = currentOffset;
  const centralParts: Uint8Array[] = [];
  let centralDirSize = 0;

  for (const entry of fileEntries) {
    const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(centralHeader.buffer);

    view.setUint32(0, 0x02014b50, true); // Central directory file header signature
    view.setUint16(4, 20, true);         // Version made by
    view.setUint16(6, 20, true);         // Version needed
    view.setUint16(8, 0x0800, true);     // Flags (UTF-8)
    view.setUint16(10, 0, true);        // Compression (0 = store)
    view.setUint16(12, 0, true);        // Mod time
    view.setUint16(14, 0x5421, true);   // Mod date
    view.setUint32(16, entry.crc, true); // CRC-32
    view.setUint32(20, entry.dataBytes.length, true); // Compressed size
    view.setUint32(24, entry.dataBytes.length, true); // Uncompressed size
    view.setUint16(28, entry.nameBytes.length, true); // File name length
    view.setUint16(30, 0, true);        // Extra field length
    view.setUint16(32, 0, true);        // File comment length
    view.setUint16(34, 0, true);        // Disk number start
    view.setUint16(36, 0, true);        // Internal file attributes
    view.setUint32(38, 0, true);        // External file attributes
    view.setUint32(42, entry.offset, true); // Relative offset of local header

    centralHeader.set(entry.nameBytes, 46);

    centralParts.push(centralHeader);
    centralDirSize += centralHeader.length;
  }

  // End of central directory record
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true);          // Number of this disk
  eocdView.setUint16(6, 0, true);          // Disk where CD starts
  eocdView.setUint16(8, files.length, true); // Number of CD records on this disk
  eocdView.setUint16(10, files.length, true); // Total number of CD records
  eocdView.setUint32(12, centralDirSize, true); // Size of central directory
  eocdView.setUint32(16, centralDirStart, true); // Offset of CD start
  eocdView.setUint16(20, 0, true);         // Comment length

  const allParts: BlobPart[] = [...localParts, ...centralParts, eocd] as unknown as BlobPart[];
  return new Blob(allParts, { type: 'application/zip' });
}
