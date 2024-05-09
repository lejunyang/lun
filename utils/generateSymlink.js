import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

async function createSymlinks(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true }); // make sure dest dir exists
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await createSymlinks(srcPath, destPath);
      } else if (entry.name.endsWith('.md')) {
        // copy md file
        await fs.copyFile(srcPath, destPath);
      } else {
        await fs.symlink(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error('Error creating symlinks:', error);
  }
}

const langs = new Set(['en']);
const excludes = new Set(['.vitepress']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // __dirname is not defined in ES module scope

fs.readdir(path.join(__dirname, '../src/docs'), { withFileTypes: true }).then((entries) => {
  for (const entry of entries) {
    if (excludes.has(entry.name)) continue;
    console.log('entries.name', entry.name);
    if (entry.isDirectory() && !langs.has(entry.name)) {
      for (const lang of langs) {
        const src = path.join(__dirname, `../src/docs/${entry.name}`),
          dest = path.join(__dirname, `../src/docs/${lang}/${entry.name}`);
        createSymlinks(src, dest);
      }
    }
  }
});
