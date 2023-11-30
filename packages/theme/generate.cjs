const fs = require('fs');
const path = require('path');

const colorsDir = path.join(__dirname, './node_modules/@radix-ui/colors');

const existInLightAndDark = ['black-alpha.css'];

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
    return content
      .replace(/.+{\n([^}]*)\n}/, (_, $1) => {
        $1 = $1
          .split('\n')
          .map((line) => `    ${line.trim()}`)
          .join('\n');
        if (existInLightAndDark.includes(file)) {
          return `#{$theme-provider-el-name} {
${$1}
}`;
        }
        return `#{$theme-provider-el-name} {
  @include lightTheme(${String(isLight)}) {
${$1}
  }
}`;
      })
      .replace(/--/g, `--#{$namespace}-`);
  });
  output.unshift('@use "../mixins/config" as *;');
  output.unshift('@use "../mixins/theme" as *;');
  console.log(output.join('\n'));
});
