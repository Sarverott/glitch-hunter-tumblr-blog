/**
 * Build script for Glitch Hunter Tumblr Theme
 * Exports standalone theme.html and contact.html into dist-tumblr/
 * Can be run manually: npm run build:theme
 * Also executed by GitHub Actions workflow on release
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTumblrThemeHtml, generateTumblrContactPageHtml } from '../src/services/tumblrTheme.ts';
import { renderTemplate } from '../src/utils/templateEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.resolve(rootDir, 'dist-tumblr');
const resourcesDir = path.resolve(rootDir, 'resources');

console.log('>>> [GLITCH HUNTER] Building Tumblr Theme artifacts...');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Build Main Theme HTML
const themeHtml = generateTumblrThemeHtml({
  accentColor: '#00ff66',
  bgColor: '#0a0d0b',
  blogTitle: 'GLITCH HUNTER // IN THE WILD',
  enableMatrixRain: true,
});

const themePath = path.join(outputDir, 'theme.html');
fs.writeFileSync(themePath, themeHtml, 'utf-8');
console.log(`[+] Exported main Tumblr theme to: dist-tumblr/theme.html (${themeHtml.length} bytes)`);

// 2. Build Embedded /SEND_GLITCH.exe Subpage HTML
const contactHtml = generateTumblrContactPageHtml({
  accentColor: '#00ff66',
  bgColor: '#0a0d0b',
});

const contactPath = path.join(outputDir, 'contact.html');
fs.writeFileSync(contactPath, contactHtml, 'utf-8');
console.log(`[+] Exported embedded submission subpage to: dist-tumblr/contact.html (${contactHtml.length} bytes)`);

// 3. Write Release Notes & Deployment Guide via delegated template
const readmeTemplatePath = path.join(resourcesDir, 'dist-readme.md');
const readmeTemplate = fs.readFileSync(readmeTemplatePath, 'utf-8');
const readmeContent = renderTemplate(readmeTemplate, {
  data: {
    timestamp: new Date().toISOString(),
    blogUrl: 'glitch-hunter.tumblr.com',
  },
});

fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent, 'utf-8');
console.log('[+] Generated dist-tumblr/README.md from resources/dist-readme.md');
console.log('>>> [GLITCH HUNTER] Theme build complete!');
