/**
 * GitHub Pages has no "serve index.html for every route" setting.
 * It does serve 404.html for unknown paths — so 404.html is a copy of index.html,
 * and the client-side router opens the right page (e.g. after a refresh on /ru/catalog).
 * .nojekyll stops GitHub from hiding files that start with an underscore.
 */
import { copyFileSync, writeFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
writeFileSync('dist/.nojekyll', '');
console.log('postbuild: 404.html + .nojekyll ready');
