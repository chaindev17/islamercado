// Genera los iconos PWA a partir del logo (app/icon.svg)
// Uso: npm run icons
import { readFile, mkdir } from "fs/promises";
import sharp from "sharp";

const SVG_PATH = "app/icon.svg";
const OUT_DIR = "public/icons";
const DENSITY = (512 / 64) * 72; // viewBox 64 → render nítido a 512px

const svg = await readFile(SVG_PATH);

await mkdir(OUT_DIR, { recursive: true });

// Iconos estándar
for (const size of [192, 512]) {
  await sharp(svg, { density: DENSITY })
    .resize(size, size)
    .png()
    .toFile(`${OUT_DIR}/icon-${size}.png`);
}

// Maskable: logo al 75% sobre fondo sol (zona segura para círculos)
const logo = await sharp(svg, { density: DENSITY })
  .resize(384, 384)
  .png()
  .toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#ffc53d" },
})
  .composite([{ input: logo, top: 64, left: 64 }])
  .png()
  .toFile(`${OUT_DIR}/maskable-512.png`);

// Apple touch icon (180, fondo sólido)
await sharp(svg, { density: DENSITY })
  .resize(180, 180)
  .flatten({ background: "#ffc53d" })
  .png()
  .toFile(`${OUT_DIR}/apple-touch-icon.png`);

console.log("✔ Iconos PWA generados en public/icons/");
