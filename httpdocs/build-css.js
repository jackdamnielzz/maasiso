const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

// CSS files in order of importance
const cssFiles = [
    'reset.css',
    'base.css',
    'utilities.css',
    'layout.css',
    'grid.css',
    'navigation.css',
    'buttons.css',
    'forms.css',
    'hero.css',
    'sections.css',
    'cards.css',
    'footer.css',
    'animations.css',
    'responsive-layout.css',
    'responsive-navigation.css',
    'responsive-components.css',
    'responsive-global.css',
    'cookie-banner.css',
    'scroll-to-top.css',
    'iso-27001-process.css',
    'contact.css',
    'legal.css'
];

const cssDir = path.join(__dirname, 'css');
let combinedCSS = '';

// Combine all CSS files
cssFiles.forEach(file => {
    const filePath = path.join(cssDir, file);
    if (fs.existsSync(filePath)) {
        const css = fs.readFileSync(filePath, 'utf8');
        combinedCSS += css + '\n';
    }
});

// Minify the combined CSS
const minified = new CleanCSS({
    level: 2,
    format: 'keep-breaks'
}).minify(combinedCSS);

// Write the minified CSS to file
fs.writeFileSync(
    path.join(cssDir, 'maasiso.min.css'),
    minified.styles
);

console.log('CSS files combined and minified successfully!');
