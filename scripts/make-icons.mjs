import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const iconsDir = path.join(publicDir, "icons");
const brandDir = path.join(publicDir, "brand");

await fs.mkdir(iconsDir, { recursive: true });
await fs.mkdir(brandDir, { recursive: true });

const fullLogo = path.join(root, "Takhmis.png");
const transparentLogo = path.join(root, "Takhmis-NO-BG.png");

await fs.copyFile(transparentLogo, path.join(brandDir, "logo.png"));
await fs.copyFile(fullLogo, path.join(brandDir, "logo-full.png"));

const trimmed = await sharp(transparentLogo)
  .trim({ threshold: 2 })
  .png()
  .toBuffer();

const trimmedMeta = await sharp(trimmed).metadata();

await sharp(trimmed)
  .resize({
    width: 720,
    height: 720,
    fit: "inside",
    withoutEnlargement: true,
  })
  .png()
  .toFile(path.join(brandDir, "logo-mark.png"));

for (const size of [64, 192, 512]) {
  await sharp(fullLogo)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(path.join(iconsDir, `icon-${size}.png`));
}

await sharp(fullLogo)
  .resize(180, 180, { fit: "cover" })
  .png()
  .toFile(path.join(iconsDir, "apple-touch-icon.png"));

// Maskable icon with safe padding
const maskableSize = 512;
const inner = 410;
const maskable = await sharp(fullLogo)
  .resize(inner, inner, { fit: "cover" })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: "#190019",
  },
})
  .composite([{ input: maskable, gravity: "center" }])
  .png()
  .toFile(path.join(iconsDir, "maskable-512.png"));

await sharp(fullLogo)
  .resize(64, 64, { fit: "cover" })
  .png()
  .toFile(path.join(root, "src", "app", "icon.png"));

await sharp(fullLogo)
  .resize(180, 180, { fit: "cover" })
  .png()
  .toFile(path.join(root, "src", "app", "apple-icon.png"));

// Social share image
const ogWidth = 1200;
const ogHeight = 630;
const mark = await sharp(trimmed)
  .resize({ width: 430, height: 430, fit: "inside" })
  .png()
  .toBuffer();

const background = Buffer.from(`
<svg width="${ogWidth}" height="${ogHeight}" viewBox="0 0 ${ogWidth} ${ogHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="a" cx="80%" cy="10%" r="75%">
      <stop offset="0%" stop-color="#522B5B"/>
      <stop offset="55%" stop-color="#2B124C"/>
      <stop offset="100%" stop-color="#190019"/>
    </radialGradient>
    <radialGradient id="b" cx="12%" cy="90%" r="60%">
      <stop offset="0%" stop-color="#854F6C" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#190019" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#DFB6B2" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#DFB6B2" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${ogWidth}" height="${ogHeight}" fill="url(#a)"/>
  <rect width="${ogWidth}" height="${ogHeight}" fill="url(#b)"/>
  <circle cx="930" cy="315" r="270" fill="none" stroke="url(#line)" stroke-width="1.5"/>
  <circle cx="930" cy="315" r="330" fill="none" stroke="url(#line)" stroke-width="1"/>
  <circle cx="140" cy="120" r="2" fill="#FBE4D8" opacity="0.7"/>
  <circle cx="250" cy="520" r="3" fill="#DFB6B2" opacity="0.35"/>
  <circle cx="1050" cy="540" r="2" fill="#FBE4D8" opacity="0.5"/>
</svg>`);

await sharp(background)
  .composite([{ input: mark, left: 715, top: 105 }])
  .png()
  .toFile(path.join(brandDir, "og.png"));

console.log("✓ brand + icons generated", {
  trimmed: `${trimmedMeta.width}x${trimmedMeta.height}`,
  icons: [64, 192, 512],
});
