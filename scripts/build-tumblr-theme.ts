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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.resolve(rootDir, 'dist-tumblr');

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

// 2. Build Embedded /contact Subpage HTML
const contactHtml = generateTumblrContactPageHtml({
  accentColor: '#00ff66',
  bgColor: '#0a0d0b',
});

const contactPath = path.join(outputDir, 'contact.html');
fs.writeFileSync(contactPath, contactHtml, 'utf-8');
console.log(`[+] Exported embedded /contact subpage to: dist-tumblr/contact.html (${contactHtml.length} bytes)`);

// 3. Write Release Notes & Deployment Guide
const readmeContent = `# Glitch Hunter // Tumblr Theme Release

Generated: ${new Date().toISOString()}
Target Blog: glitch-hunter.tumblr.com

## Files Included:
- \`theme.html\`: The full custom theme template code (Matrix green phosphor HUD, CRT scanlines, NPF support).
- \`contact.html\`: The embedded \`/contact\` subpage code for submitting glitch discoveries.

## How to Install on Tumblr:

### 1. Main Theme Installation:
1. Log into [Tumblr](https://www.tumblr.com) and go to your blog: \`glitch-hunter.tumblr.com\`.
2. Click **Edit theme** (or navigate to \`https://www.tumblr.com/customize/glitch-hunter\`).
3. Click **Edit HTML** on the left panel.
4. Select all existing HTML (\`Ctrl+A\` or \`Cmd+A\`) and replace it with the entire content of \`theme.html\`.
5. Click **Update Preview**, then **Save**.

### 2. Embedded /contact Subpage Installation:
1. Go to your blog settings: \`https://www.tumblr.com/settings/blog/glitch-hunter\`.
2. Scroll to the **Pages** section and click **Add a page**.
3. Set the Page URL to: \`/contact\`.
4. Set the Page Title to: \`Contact & Submit Glitch\`.
5. Under Layout, select **Custom layout** (or toggle code view).
6. Paste the entire content of \`contact.html\` into the page editor.
7. Click **Save**.

Your Tumblr blog is now fully equipped with the Matrix aesthetic, live glitch catalog, and embedded submission portal!
`;

fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent, 'utf-8');
console.log('[+] Generated dist-tumblr/README.md');
console.log('>>> [GLITCH HUNTER] Theme build complete!');
