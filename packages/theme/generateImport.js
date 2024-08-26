import * as RadixColors from '@radix-ui/colors';

const colors = [],
  darkColors = [],
  p3Colors = [],
  darkP3Colors = [];

Object.keys(RadixColors).forEach((name) => {
  if (name.startsWith('_') || name === 'default') return; // ignore __esModule and default
  const dark = name.includes('Dark');
  if (name.includes('P3')) {
    (dark ? darkP3Colors : p3Colors).push(name);
  } else {
    (dark ? darkColors : colors).push(name);
  }
});

console.log(`import { ${colors.join(', ')} } from '@radix-ui/colors';`);
console.log(`import { ${darkColors.join(', ')} } from '@radix-ui/colors';`);
console.log(`import { ${p3Colors.join(', ')} } from '@radix-ui/colors';`);
console.log(`import { ${darkP3Colors.join(', ')} } from '@radix-ui/colors';`);
