const fs = require('fs');
const path = require('path');

const logoBuf = fs.readFileSync(path.join(__dirname, '../public/favicon-48x48.png'));
const base64 = logoBuf.toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <image href="data:image/png;base64,${base64}" x="0" y="0" width="48" height="48" />
</svg>`;

fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svg, 'utf8');
console.log('✅ favicon.svg updated with Burhani Tutorials logo!');
