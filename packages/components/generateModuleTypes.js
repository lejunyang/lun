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
  const propType = `import('./index').${componentCamelName}Props`;
  const vueCompType = `Vue.DefineComponent<${propType}>`;
  const vuePropType = `Vue.HTMLAttributes &  Vue.ReservedProps & ${propType}`;
  const reactPropType = `React.HTMLAttributes<HTMLElement> & ${propType}`;
  vueCompTypes.push(`    L${componentCamelName}: ${vueCompType};`);
  vueJSXTypes.push(`      'l-${componentTag}': ${vuePropType};`);
  htmlTypes.push(`    'l-${componentTag}': import('./index').t${componentCamelName};`);
  reactTypes.push(`      'l-${componentTag}': ${reactPropType};`);
});

fs.writeFileSync(
  './dist/elements-types-vue.d.ts',
  // must import vue in the module declaration file(or add export declaration), or it will override vue's declaration, which will lead to ts error `module 'vue' has no exported member xxx'
  // Apart from that, if we don't add this import declaration, we can't write native elements like button, div..., as they have all been overridden
  `import * as Vue from 'vue';
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
  './dist/elements-types-html.d.ts',
  `declare global {
  interface HTMLElementTagNameMap {
${htmlTypes.join('\n')}
  }
}
export {}`,
  { encoding: 'utf8' },
);

fs.writeFileSync(
  './dist/elements-types-react.d.ts',
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
