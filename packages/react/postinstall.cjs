const fs = require('fs');
const path = require('path');

let react;
try {
  react = require('react');
} catch (error) {
  console.error('[@lun-web/react] react is not installed. Run `npm install react` to install it.');
}

const [majorVersion] = react.version.split('.').map(Number);

const dist19Path = path.join(__dirname, 'dist', '19'),
  distPath = path.join(__dirname, 'dist');

if (majorVersion === 19) {
  // update all other files under dist/19 into dist expect index19.d.ts
  try {
    // check if dist/19 exists
    if (!fs.existsSync(dist19Path)) return;
    
    const files = fs.readdirSync(dist19Path);
    files.forEach((file) => {
      if (file.endsWith('.d.ts')) return;
      const src = path.join(dist19Path, file);
      const dest = path.join(distPath, file);
      try {
        // for pnpm
        fs.unlinkSync(dest);
      } catch (error) {}
      fs.copyFileSync(src, dest);
    });
    // update index.d.ts
    fs.copyFileSync(path.join(dist19Path, 'index19.d.ts'), path.join(distPath, 'index.d.ts'));
  } catch (error) {
    console.error('[@lun-web/react] an error occurred while processing files for react19: ', error);
    console.error('If you think this is a bug, please report it at https://github.com/lejunyang/lun/issues');
  }
} else if (majorVersion < 16) {
  console.error('[@lun-web/react] react version should be higher than 16.');
}
