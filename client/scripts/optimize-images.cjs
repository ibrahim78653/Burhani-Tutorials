/**
 * Image Optimization Script
 * Converts all JPEG images in public/photos and public/ to WebP
 * Run: node scripts/optimize-images.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const PHOTO_DIR = path.join(__dirname, '../public/photos');
const PUBLIC_DIR = path.join(__dirname, '../public');

const PHOTO_TARGETS = [
  { input: 'landing-1.1.jpeg', output: 'landing-1.1.webp', width: 1280, quality: 82 },
  { input: 'landing-1.2.jpeg', output: 'landing-1.2.webp', width: 1280, quality: 82 },
  { input: 'landing-1.3.jpeg', output: 'landing-1.3.webp', width: 1280, quality: 82 },
  { input: 'landing-1.4.jpeg', output: 'landing-1.4.webp', width: 1280, quality: 82 },
  { input: 'about-2.1.jpeg',   output: 'about-2.1.webp',   width: 900,  quality: 82 },
  { input: 'teachers-day-3.1.jpeg', output: 'teachers-day-3.1.webp', width: 900, quality: 80 },
  { input: 'teachers-day-3.2.jpeg', output: 'teachers-day-3.2.webp', width: 900, quality: 80 },
  { input: 'teachers-day-3.3.jpeg', output: 'teachers-day-3.3.webp', width: 900, quality: 80 },
  { input: 'teachers-day-3.4.jpeg', output: 'teachers-day-3.4.webp', width: 900, quality: 80 },
];

const PUBLIC_TARGETS = [
  { input: 'mazhar_husain.jpeg', output: 'mazhar_husain.webp', width: 400, quality: 85 },
  { input: 'yusuf_ali.jpeg',     output: 'yusuf_ali.webp',     width: 400, quality: 85 },
  { input: 'bt-logo.jpeg',       output: 'bt-logo.webp',       width: 300, quality: 90 },
];

async function convertImages(targets, dir, label) {
  console.log(`\n=== ${label} ===`);
  for (const t of targets) {
    const inputPath = path.join(dir, t.input);
    const outputPath = path.join(dir, t.output);
    if (!fs.existsSync(inputPath)) {
      console.log(`  ⚠️  SKIP (not found): ${t.input}`);
      continue;
    }
    try {
      const inputStat = fs.statSync(inputPath);
      await sharp(inputPath)
        .resize({ width: t.width, withoutEnlargement: true })
        .webp({ quality: t.quality, effort: 4 })
        .toFile(outputPath);
      const outputStat = fs.statSync(outputPath);
      const saving = Math.round((1 - outputStat.size / inputStat.size) * 100);
      console.log(`  ✅ ${t.input} (${Math.round(inputStat.size/1024)} KB) → ${t.output} (${Math.round(outputStat.size/1024)} KB) — saved ${saving}%`);
    } catch (err) {
      console.error(`  ❌ ERROR converting ${t.input}:`, err.message);
    }
  }
}

(async () => {
  await convertImages(PHOTO_TARGETS, PHOTO_DIR, 'Gallery / Hero Photos');
  await convertImages(PUBLIC_TARGETS, PUBLIC_DIR, 'Public Assets');
  console.log('\n✨ Optimization complete!');
})();
