const fs = require('fs');
const path = require('path');

const versionType = process.argv[2],
  prereleaseMode = process.argv[3];

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Version type(the second argument) must be one of: patch, minor, major');
  process.exit(1);
}

if (prereleaseMode && !['enter', 'exit'].includes(prereleaseMode)) {
  console.error('Prerelease mode(the third argument) must be one of: enter, exit');
  process.exit(1);
}

const cwd = process.cwd();
const packagesDir = path.join(cwd, 'packages');
const changesetsDir = path.join(cwd, '.changesets');

function updateVersion(version, type) {
  const [versionNumStr, prerelease] = version.split('-'); // prerelease
  let tag, prereleaseVersion;
  if (prerelease) {
    [tag, prereleaseVersion] = prerelease.split('.');
    prereleaseVersion = +prereleaseVersion;
  }
  const [major, minor, patch] = versionNumStr.split('.').map(Number);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      if ((tag || prereleaseMode === 'enter') && prereleaseVersion !== 'exit')
        return `${major}.${minor}.${patch}-${tag || 'alpha'}.${(prereleaseVersion ?? 0) + 1}`;
      return `${major}.${minor}.${patch + 1}`;
    default:
      return version;
  }
}

fs.readdir(packagesDir, (err, folders) => {
  if (err) {
    console.error('Failed to read packages directory:', err);
    return;
  }

  folders.forEach((folder) => {
    const packageJsonPath = path.join(packagesDir, folder, 'package.json');

    // check if package.json exists
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath);
      const { name, version } = packageJson;

      // updateVersion
      const newVersion = updateVersion(version, versionType);
      const filename = `${name.replace('@lun-web/', '')}-${newVersion}.md`;
      const changesetPath = path.join(changesetsDir, filename);

      // check if changeset md file exists
      if (!fs.existsSync(changesetPath)) {
        // md file content
        const content = `---\n${name}: ${versionType}\n---\n`;

        fs.writeFile(changesetPath, content, (err) => {
          if (err) {
            console.error(`Failed to create ${filename}:`, err);
          } else {
            console.log(`Successfully created ${filename}`);
          }
        });
      } else {
        console.log(`${filename} already exists, skipping`);
      }
    }
  });
});
