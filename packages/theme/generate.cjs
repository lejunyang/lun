const fs = require('fs');
const path = require('path');

const colorsDir = path.join(__dirname, './node_modules/@radix-ui/colors');

fs.readdir(colorsDir, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }
  const output = files.map((file) => {
    if (path.extname(file) !== '.css') return;
    const filePath = path.join(colorsDir, file);
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const isLight = content.includes('light');
    return content.replace(/.+{/, `.#{$namespace}-${isLight ? 'light' : 'dark'}-theme {`);
  });
  output.unshift('@use "../mixins/config" as *;');
  console.log(output.join('\n'));
});
