const fs = require('fs');
const path = require('path');

// Ensure the icons directory exists
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// New quality icon SVG - simple checkmark (V) icon
const qualityIconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 6L9 17L4 12" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Write the new quality icon
const qualityIconPath = path.join(iconsDir, 'quality.svg');
fs.writeFileSync(qualityIconPath, qualityIconSvg);

console.log('Quality icon updated successfully!');