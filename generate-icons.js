const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generateIconPNG(size, outPath) {
  const width = size;
  const height = size;

  // RGBA buffer for image
  // Let's draw a nice blue circle with a magnifying glass / lens effect
  const rawData = [];
  const radius = size * 0.44;
  const cx = size / 2;
  const cy = size / 2;

  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter type none
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inner lens: Blue gradient (#2563EB to #1D4ED8)
        const innerDist = Math.sqrt((x - cx * 0.8) * (x - cx * 0.8) + (y - cy * 0.8) * (y - cy * 0.8));
        if (innerDist < radius * 0.5) {
          // Highlight
          rawData.push(59, 130, 246, 255); // #3B82F6
        } else {
          rawData.push(37, 99, 235, 255);  // #2563EB
        }
      } else if (dist <= radius + 1.2) {
        // Border ring: Deep blue (#1E40AF)
        rawData.push(30, 64, 175, 255);
      } else {
        // Transparent
        rawData.push(0, 0, 0, 0);
      }
    }
  }

  const rawBuffer = Buffer.from(rawData);
  const compressedData = zlib.deflateSync(rawBuffer);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outPath, png);
  console.log(`Wrote ${outPath} (${size}x${size}, ${png.length} bytes)`);
}

const iconsDir = path.join(__dirname, 'weblens', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

generateIconPNG(16, path.join(iconsDir, 'icon16.png'));
generateIconPNG(48, path.join(iconsDir, 'icon48.png'));
generateIconPNG(128, path.join(iconsDir, 'icon128.png'));
