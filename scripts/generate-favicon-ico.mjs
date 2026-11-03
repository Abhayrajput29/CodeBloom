import { writeFileSync } from "node:fs";
import sharp from "sharp";

// The official CodeBloom Sprout SVG (matching Image 1 exactly)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <radialGradient id="ambient" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.22" />
      <stop offset="60%" stop-color="#831843" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#0c0414" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f472b6" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#c04878" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#831843" stop-opacity="0.3" />
    </linearGradient>
    <linearGradient id="sprout-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d85080" />
      <stop offset="50%" stop-color="#f472b6" />
      <stop offset="100%" stop-color="#fbcfe8" />
    </linearGradient>
    <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Dark rounded container with soft border (matching Image 1) -->
  <rect width="64" height="64" rx="16" fill="#110915" />
  <rect width="64" height="64" rx="16" fill="url(#ambient)" />
  <rect width="61" height="61" x="1.5" y="1.5" rx="14.5" stroke="url(#border-grad)" stroke-width="1.8" fill="none" />

  <!-- The Official CodeBloom Sprout Mark -->
  <g transform="translate(11, 11) scale(1.75)" stroke="url(#sprout-grad)" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#soft-glow)">
    <path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" />
    <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" />
    <path d="M5 21h14" />
  </g>
</svg>`;

async function main() {
  // 1. Write the SVG files
  writeFileSync("app/icon.svg", svg, "utf-8");
  writeFileSync("public/icon.svg", svg, "utf-8");
  writeFileSync("public/favicon.svg", svg, "utf-8");
  console.log("Wrote SVG favicons");

  // 2. Generate PNG buffers at 16x16, 32x32, 48x48 using sharp
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // 3. Pack into standard multi-resolution ICO file
  // ICO header: 6 bytes
  // Directory entries: sizes.length * 16 bytes
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = sizes.length * dirEntrySize;
  let currentOffset = headerSize + dirSize;

  const icoBuffer = Buffer.alloc(
    currentOffset + pngBuffers.reduce((sum, b) => sum + b.length, 0)
  );

  // Write ICO Header
  icoBuffer.writeUInt16LE(0, 0); // Reserved (0)
  icoBuffer.writeUInt16LE(1, 2); // Image type: 1 = ICO
  icoBuffer.writeUInt16LE(sizes.length, 4); // Number of images

  // Write Directory Entries
  sizes.forEach((size, index) => {
    const png = pngBuffers[index];
    const offset = headerSize + index * dirEntrySize;

    icoBuffer.writeUInt8(size === 256 ? 0 : size, offset); // Width
    icoBuffer.writeUInt8(size === 256 ? 0 : size, offset + 1); // Height
    icoBuffer.writeUInt8(0, offset + 2); // Color palette
    icoBuffer.writeUInt8(0, offset + 3); // Reserved
    icoBuffer.writeUInt16LE(1, offset + 4); // Color planes
    icoBuffer.writeUInt16LE(32, offset + 6); // Bits per pixel
    icoBuffer.writeUInt32LE(png.length, offset + 8); // Image size in bytes
    icoBuffer.writeUInt32LE(currentOffset, offset + 12); // Offset of image data

    // Copy PNG data
    png.copy(icoBuffer, currentOffset);
    currentOffset += png.length;
  });

  // Write ICO files
  writeFileSync("app/favicon.ico", icoBuffer);
  writeFileSync("public/favicon.ico", icoBuffer);
  console.log("Wrote app/favicon.ico and public/favicon.ico");

  // Also generate 180x180 apple touch icon
  const appleIcon = await sharp(Buffer.from(svg)).resize(180, 180).png().toBuffer();
  writeFileSync("public/apple-touch-icon.png", appleIcon);
  console.log("Wrote public/apple-touch-icon.png");
}

main().catch(console.error);
