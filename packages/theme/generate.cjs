const fs = require('fs');
const path = require('path');

const colorsDir = path.join(__dirname, './node_modules/@radix-ui/colors');

fs.readdir(colorsDir, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }
  const cssFiles = files.filter((file) => path.extname(file) === '.css');
  const importRules = cssFiles.map((file) => `@import "${path.join('@radix-ui/colors', file)}";`);
  console.log(importRules.join('\n'));
});