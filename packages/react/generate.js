import { components } from '@lun-web/components';
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

function generateCode(component, react19AndLater) {
  const camelCase = toCamelCase(component);
  const pascalCase = toPascalCase(component);
  return `import { ${
    react19AndLater ? '' : `${camelCase}Emits, ${camelCase}Props, `
  }define${pascalCase}, ${pascalCase}Props, i${pascalCase} } from '@lun-web/components';
import createComponent from '../createComponent${react19AndLater ? '19' : ''}';

export const L${pascalCase} = createComponent<${pascalCase}Props, i${pascalCase}>('${component}', define${pascalCase}${
    react19AndLater ? '' : `, ${camelCase}Props, ${camelCase}Emits`
  });
if (__DEV__) L${pascalCase}.displayName = 'L${pascalCase}';
`;
}

function writeToFile(directory, component, code) {
  const fileName = `${toPascalCase(component)}.tsx`;
  fs.writeFileSync(path.join(directory, fileName), code);
}

let exportStatements = `export * from './src/hooks';\n`;
let exportStatements19 = `export * from './src/hooks';\n`;
components.forEach((component) => {
  const Comp = toPascalCase(component);
  exportStatements += `export { L${Comp} } from './src/components/${Comp}';\n`;
  exportStatements19 += `export { L${Comp} } from './src/components19/${Comp}';\n`;

  writeToFile('./src/components', component, generateCode(component));
  writeToFile('./src/components19', component, generateCode(component, true));
});

fs.writeFileSync('./index.ts', exportStatements);
fs.writeFileSync('./index19.ts', exportStatements19);
