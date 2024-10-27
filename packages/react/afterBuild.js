import fs from 'fs';

const indexContent = fs.readFileSync('./dist/index.d.ts', { encoding: 'utf8' });
fs.writeFileSync(
  './dist/index.d.ts',
  indexContent
    .replace(/'.+LUNCOMPONENTS'/g, `'@lun-web/components'`)
    .replace(/'.+LUNCOER'/g, `'@lun-web/core'`)
    .replace(/'.+LUNUTILS'/g, `'@lun-web/utils'`),
  { encoding: 'utf8' },
);
