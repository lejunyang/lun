import { components } from '@lun/components';
import { camelize, capitalize } from 'vue';
import fs from 'fs';

// declare module is not exported by api-extractor, so we have to generate the file manually
// https://github.com/microsoft/rushstack/issues/2090
// https://github.com/qmhc/vite-plugin-dts/issues/240 

const vueCompTypes = [];
const vueJSXTypes = [];
const htmlTypes = [];
const reactTypes = [];

components.forEach((componentTag) => {
  const componentCamelName = camelize(capitalize(componentTag));
  const compType = `import('./index').${componentCamelName}`;
  const propType = `import('./index').${componentCamelName}Props`;
  vueCompTypes.push(`    L${componentCamelName}: ${compType};`);
  vueJSXTypes.push(`    'l-${componentTag}': ${propType};`);
  htmlTypes.push(`    'l-${componentTag}': ${compType};`);
  reactTypes.push(`      'l-${componentTag}': ${propType};`);
});

fs.writeFileSync(
  './dist/vue-elements.d.ts',
  `declare module 'vue' {
  interface GlobalComponents {
${vueCompTypes.join('\n')}
  }
  interface IntrinsicElementAttributes {
${vueJSXTypes.join('\n')}
  }
}`,
  { encoding: 'utf8' }
);

fs.writeFileSync(
  './dist/html-elements.d.ts',
  `declare global {
  interface HTMLElementTagNameMap {
${htmlTypes.join('\n')}
  }
}`,
  { encoding: 'utf8' }
);

fs.writeFileSync(
  './dist/react-elements.d.ts',
  `declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
${reactTypes.join('\n')}
    }
  }
}`,
  { encoding: 'utf8' }
);
