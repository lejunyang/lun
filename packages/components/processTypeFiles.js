import { components } from '@lun-web/components';
import { camelize, capitalize } from 'vue';
import fs from 'fs';
import path from 'path';

(() => {
  if (process.env.DEPLOYED_ON) return;

  // declare module is not exported by api-extractor, so we have to generate the file manually
  // https://github.com/microsoft/rushstack/issues/2090
  // https://github.com/qmhc/vite-plugin-dts/issues/240

  const vueCompTypes = [];
  const vueJSXTypes = [];
  const htmlTypes = [];
  const reactTypes = [];

  components.forEach((componentTag) => {
    const componentCamelName = camelize(capitalize(componentTag));
    const importPrefix = `LunComps.`;
    const propType = `${importPrefix}${componentCamelName}Props`,
      instanceType = `${importPrefix}i${componentCamelName}`;
    // tried Omit<Vue.ReservedProps, 'ref'> & { ref?: string | Vue.Ref<${instanceType}> | ((el: ${instanceType} | null) => void) }, but ref doesn't work as expected
    const vuePropType = `Vue.HTMLAttributes & Vue.PublicProps & ${propType}`;
    const reactPropType = `React.HTMLAttributes<${instanceType}> & React.RefAttributes<${instanceType}> & ${propType}`;
    vueCompTypes.push(
      // for DefineVueCustomElement, we must pass the third param to pick certain props, otherwise keyof VueElement will include all HTML attributes and conflict with Vue HTMLAttributes
      `    L${componentCamelName}: ${importPrefix}DefineVueCustomElement<${importPrefix}i${componentCamelName}, ${importPrefix}${componentCamelName}EventMap, keyof ${importPrefix}${componentCamelName}SetupProps>;`,
    );
    vueJSXTypes.push(`      'l-${componentTag}': ${vuePropType};`);
    htmlTypes.push(`    'l-${componentTag}': ${importPrefix}.i${componentCamelName};`);
    reactTypes.push(`      'l-${componentTag}': ${reactPropType};`);
  });

  fs.writeFileSync(
    './dist/elements-types-vue.d.ts',
    // must import vue in the module declaration file(or add export declaration), or it will override vue's declaration, which will lead to ts error `module 'vue' has no exported member xxx'
    // Apart from that, if we don't add this import declaration, we can't write native elements like button, div..., as they have all been overridden
    `import * as Vue from 'vue';
import * as LunComps from './index';
declare module 'vue' {
  interface GlobalComponents {
${vueCompTypes.join('\n')}
  }
}
declare module 'vue/jsx-runtime' {
  namespace JSX {
    export interface IntrinsicElements extends Vue.NativeElements {
${vueJSXTypes.join('\n')}
    }
  }
}`,
    { encoding: 'utf8' },
  );

  fs.writeFileSync(
    './dist/elements-types-html.d.ts',
    `import * as LunComps from './index';
declare global {
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
import * as LunComps from './index';
declare module 'react/jsx-runtime' {
  namespace JSX {
    export interface IntrinsicElements extends React.JSX.IntrinsicElements {
${reactTypes.join('\n')}
    }
  }
}`,
    { encoding: 'utf8' },
  );

  // replace the import path of LUNCOER with @lun-web/core, the reason refers to tsconfig.build.json
  const indexContent = fs.readFileSync('./dist/index.d.ts', { encoding: 'utf8' });
  fs.writeFileSync(
    './dist/index.d.ts',
    indexContent.replace(/'.+LUNCOER'/g, `'@lun-web/core'`).replace(/'.+LUNUTILS'/g, `'@lun-web/utils'`),
    { encoding: 'utf8' },
  );

  function deleteFilesInDirectory(directory, fileExtension) {
    const items = fs.readdirSync(directory);
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        deleteFilesInDirectory(fullPath, fileExtension);
      } else if (stat.isFile() && item.endsWith(fileExtension)) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  // delete all '.define.d.ts' files
  deleteFilesInDirectory('./dist', '.define.d.ts');
})();
