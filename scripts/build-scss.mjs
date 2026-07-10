/**
 * Compila el SCSS fuente de la plantilla Duralux (scss/) a dist/.
 * Fuente canónica: /home/pancho/duralux_plantilla/duralux-admin/assets/scss
 * (copiada a scss/ del paquete).
 */
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { writeFileSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
await mkdir(dist, { recursive: true });

const targets = [
  { entry: 'scss/bootstrap/bootstrap.scss', out: 'bootstrap.css', style: 'expanded' },
  { entry: 'scss/bootstrap/bootstrap.scss', out: 'bootstrap.min.css', style: 'compressed' },
  { entry: 'scss/theme.scss', out: 'theme.css', style: 'expanded' },
  { entry: 'scss/theme.scss', out: 'theme.min.css', style: 'compressed' },
];

for (const t of targets) {
  const result = sass.compile(join(root, t.entry), {
    style: t.style,
    loadPaths: [join(root, 'scss')],
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'abs-percent'],
  });
  writeFileSync(join(dist, t.out), result.css);
  console.log(`wrote dist/${t.out} (${result.css.length} bytes)`);
}
