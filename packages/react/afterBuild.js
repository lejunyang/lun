import fs from 'fs';

const indexContent = fs.readFileSync('./dist/index.d.ts', { encoding: 'utf8' });
fs.writeFileSync(
  './dist/index.d.ts',
  indexContent
    .replace(/'.+LUNCOMPONENTS'/g, `'@lun/components'`)
    .replace(/'.+LUNCOER'/g, `'@lun/core'`)
    .replace(/'.+LUNUTILS'/g, `'@lun/utils'`),
  { encoding: 'utf8' },
);
