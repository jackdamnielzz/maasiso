const fs = require('fs');
const path = require('path');

// Ensure the icons directory exists
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Define the icons
const icons = [
  {
    name: 'certificate',
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14 2V8H20" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 13H8" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 17H8" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10 9H9H8" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  },
  {
    name: 'shield',
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 12L11 14L15 10" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  },
  {
    name: 'privacy',
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  },
  {
    name: 'consulting',
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 16L22 22" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10 7V13" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7 10H13" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  },
  {
    name: 'training',
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  },
  {
    name: 'compliance',
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 11L12 14L22 4" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  },
  {
    name: 'risk',
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.6415 19.6871 1.81442 19.9905C1.98734 20.2939 2.23672 20.5467 2.53773 20.7238C2.83875 20.9009 3.1808 20.9961 3.53 21H20.47C20.8192 20.9961 21.1613 20.9009 21.4623 20.7238C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 9V13" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 17H12.01" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  },
  {
    name: 'quality',
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 15V23" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 18H15" stroke="#00875A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  }
];

// Create each icon file
icons.forEach(icon => {
  const filePath = path.join(iconsDir, `${icon.name}.svg`);
  fs.writeFileSync(filePath, icon.svg);
  console.log(`Created ${icon.name}.svg`);
});

console.log('All icons created successfully!');