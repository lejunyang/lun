import { components } from '@lun/components';
import fs from 'fs';
import path from 'path';

function toCamelCase(str) {
  return str
    .split('-')
    .map((word, index) => {
      if (index === 0) {
        return word;
      }
      return word[0].toUpperCase() + word.slice(1);
    })
    .join('');
}

function toPascalCase(str) {
  const camelCase = toCamelCase(str);
  return camelCase[0].toUpperCase() + camelCase.slice(1);
}

function generateCode(component) {
  const camelCase = toCamelCase(component);
  const pascalCase = toPascalCase(component);
  return `
import { ${camelCase}Emits, ${pascalCase}Props, ${camelCase}Props, define${pascalCase}, i${pascalCase} } from '@lun/components';
import createComponent from '../createComponent';

export const L${pascalCase} = createComponent<${pascalCase}Props, i${pascalCase}>('${component}', define${pascalCase}, ${camelCase}Props, ${camelCase}Emits);
if (__DEV__) L${pascalCase}.displayName = 'L${pascalCase}';
`;
}

function writeToFile(directory, component, code) {
  const fileName = `${toPascalCase(component)}.tsx`;
  fs.writeFileSync(path.join(directory, fileName), code);
}

const directory = './src/components';

let exportStatements = ``;
components.forEach((component) => {
  const Comp = toPascalCase(component);
  exportStatements += `export { L${Comp} } from './src/components/${Comp}';\n`;

  const code = generateCode(component);
  writeToFile(directory, component, code);
});

fs.writeFileSync('./index.ts', exportStatements);
