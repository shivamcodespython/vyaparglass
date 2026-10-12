const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicIconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

// 1. Create SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#3730a3" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Inner Glass Panel -->
  <rect x="36" y="36" width="440" height="440" rx="90" fill="url(#glassGrad)" stroke="#818cf8" stroke-width="4" stroke-opacity="0.5" filter="url(#shadow)" />

  <!-- Monogram VG -->
  <g fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" text-anchor="middle">
    <text x="256" y="315" font-size="180" letter-spacing="-6" fill="#ffffff" filter="url(#shadow)">VG</text>
  </g>

  <!-- Accent Gem Diamond Top Right -->
  <polygon points="390,100 420,130 390,160 360,130" fill="#38bdf8" opacity="0.9" />
  <circle cx="390" cy="130" r="6" fill="#ffffff" />
</svg>`;

fs.writeFileSync(path.join(publicIconsDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(publicIconsDir, 'icon-192.svg'), svgContent);
fs.writeFileSync(path.join(publicIconsDir, 'icon-512.svg'), svgContent);

// 2. Pure Node.js PNG Generator (Creates valid PNG without dependencies)
function createPng(size, primaryColor, secondaryColor) {
  // RGB raw image buffer with filter byte 0 at start of each scanline
  const scanlineLength = 1 + size * 4; // 1 filter byte + 4 bytes RGBA per pixel
  const rawBuffer = Buffer.alloc(size * scanlineLength);

  const radius = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * scanlineLength;
    rawBuffer[rowOffset] = 0; // Filter None

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Rounded rect mask
      const dx = Math.max(Math.abs(x - cx) - (size / 2 - radius), 0);
      const dy = Math.max(Math.abs(y - cy) - (size / 2 - radius), 0);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        // Outside rounded corners -> transparent
        rawBuffer[pxOffset] = 0;
        rawBuffer[pxOffset + 1] = 0;
        rawBuffer[pxOffset + 2] = 0;
        rawBuffer[pxOffset + 3] = 0;
      } else {
        // Linear gradient from Indigo (79, 70, 229) to Dark Slate (15, 23, 42)
        const factor = (x + y) / (size * 2);
        const r = Math.round(79 * (1 - factor) + 15 * factor);
        const g = Math.round(70 * (1 - factor) + 23 * factor);
        const b = Math.round(229 * (1 - factor) + 42 * factor);

        // Center badge highlight
        const cdx = x - cx;
        const cdy = y - cy;
        const centerDist = Math.sqrt(cdx * cdx + cdy * cdy);
        const isHighlight = centerDist < size * 0.28 && Math.abs(cdx) < size * 0.22 && Math.abs(cdy) < size * 0.18;

        if (isHighlight) {
          rawBuffer[pxOffset] = 255;
          rawBuffer[pxOffset + 1] = 255;
          rawBuffer[pxOffset + 2] = 255;
          rawBuffer[pxOffset + 3] = 240;
        } else {
          rawBuffer[pxOffset] = r;
          rawBuffer[pxOffset + 1] = g;
          rawBuffer[pxOffset + 2] = b;
          rawBuffer[pxOffset + 3] = 255;
        }
      }
    }
  }

  // Deflate image data
  const compressedData = zlib.deflateSync(rawBuffer);

  // Helper to build chunk: length (4) + type (4) + data + crc (4)
  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);

    // Compute CRC32
    const crc = calcCrc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Standard CRC32
  function calcCrc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  // PNG Header (IHDR)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // compression 0
  ihdrData.writeUInt8(0, 11); // filter 0
  ihdrData.writeUInt8(0, 12); // interlace 0

  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

const png192 = createPng(192);
fs.writeFileSync(path.join(publicIconsDir, 'icon-192.png'), png192);

const png512 = createPng(512);
fs.writeFileSync(path.join(publicIconsDir, 'icon-512.png'), png512);

// Maskable icon (square with safe zone padding)
fs.writeFileSync(path.join(publicIconsDir, 'maskable-icon-512.png'), png512);

console.log('Successfully generated PWA icons in public/icons/');
