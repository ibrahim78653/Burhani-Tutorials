const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputLogo = path.join(__dirname, '../public/bt-logo.jpeg');
const publicDir = path.join(__dirname, '../public');

async function makeFavicons() {
  console.log('Generating favicons from:', inputLogo);
  
  // 16x16
  await sharp(inputLogo)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
    
  // 32x32
  await sharp(inputLogo)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
  // 48x48
  await sharp(inputLogo)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon-48x48.png'));

  // Main favicon.png
  await sharp(inputLogo)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // Apple touch icon 180x180
  await sharp(inputLogo)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 192x192
  await sharp(inputLogo)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'android-chrome-192x192.png'));

  // 512x512
  await sharp(inputLogo)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'android-chrome-512x512.png'));

  // favicon.ico (standard 32x32 png saved as ico or raw ico)
  await sharp(inputLogo)
    .resize(32, 32)
    .toFormat('png')
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✅ All favicon formats generated successfully!');
}

makeFavicons().catch(err => {
  console.error('Favicon generation error:', err);
});
