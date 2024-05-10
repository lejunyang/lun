import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const comment = `<!--this file is copied from chinese md, remove this comment to update it, or it will be overwritten when next build-->`;
const noSymlink = process.argv.slice(2).some((i) => i.includes('no-symlink'));

async function gen(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true }); // make sure dest dir exists
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name),
        destStat = await fs.lstat(destPath).catch(() => null);
      const destIsSymlink = destStat?.isSymbolicLink();
      if (entry.isDirectory()) {
        await gen(srcPath, destPath);
      } else if (entry.name.endsWith('.md')) {
        const srcContent = await fs.readFile(srcPath, 'utf-8');
        if (destStat) {
          const destContent = await fs.readFile(destPath, 'utf-8');
          if (!destContent.startsWith(comment)) {
            continue;
          }
        }
        fs.writeFile(destPath, `${comment}\n${srcContent}`);
      } else if (!noSymlink && (destIsSymlink === true || destIsSymlink == null)) {
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
    if (entry.isDirectory() && !langs.has(entry.name)) {
      for (const lang of langs) {
        const src = path.join(__dirname, `../src/docs/${entry.name}`),
          dest = path.join(__dirname, `../src/docs/${lang}/${entry.name}`);
        gen(src, dest);
      }
    }
  }
});
