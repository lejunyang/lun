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
  const compType = `import('./index').t${componentCamelName}`;
  const propType = `import('./index').${componentCamelName}Props`;
  const vuePropType = `vue.HTMLAttributes & ${propType}`;
  const reactPropType = `React.HTMLAttributes<HTMLElement> & ${propType}`;
  vueCompTypes.push(`    L${componentCamelName}: ${compType};`);
  vueJSXTypes.push(`      'l-${componentTag}': ${vuePropType};`);
  htmlTypes.push(`    'l-${componentTag}': ${compType};`);
  reactTypes.push(`      'l-${componentTag}': ${reactPropType};`);
});

fs.writeFileSync(
  './dist/vue-elements.d.ts',
  // must import vue in the module declaration file, or it will override vue's declaration, which will lead to ts error `module 'vue' has no exported member xxx'
  // Apart from that, if we don't add this import declaration, we can't write native elements like button, div..., as they have all been overridden
  `import * as vue from 'vue';
declare module 'vue' {
  interface GlobalComponents {
${vueCompTypes.join('\n')}
  }
}
declare module 'vue/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
${vueJSXTypes.join('\n')}
    }
  }
}`,
  { encoding: 'utf8' },
);

fs.writeFileSync(
  './dist/html-elements.d.ts',
  `declare global {
  interface HTMLElementTagNameMap {
${htmlTypes.join('\n')}
  }
}`,
  { encoding: 'utf8' },
);

fs.writeFileSync(
  './dist/react-elements.d.ts',
  // same as vue, need to import react
  `import * as React from 'react';
declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
${reactTypes.join('\n')}
    }
  }
}`,
  { encoding: 'utf8' },
);
