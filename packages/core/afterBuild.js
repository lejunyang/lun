import fs from 'fs';
/**
 * error during build:
 * Error: [vite:dts] Internal Error: Unable to determine semantic information for declaration:
 * /lun/packages/utils/src/number.ts:74:9
 * same build error as packages/components related to @lun/core
 */
const indexContent = fs.readFileSync('./dist/index.d.ts', { encoding: 'utf8' });
fs.writeFileSync('./dist/index.d.ts', indexContent.replace(/'.+LUNUTILS'/g, `'@lun/utils'`), { encoding: 'utf8' });
