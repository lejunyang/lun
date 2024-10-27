import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';
import { globSync } from 'glob';

import { getViteConfig } from '../../utils/getViteConfig';

const defines = globSync('./src/components/**/*.define.ts');

export default getViteConfig('@lun-web/components', {
  plugins: [
    // @ts-ignore
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('l-'),
        },
      },
    }),
    vueJsx({
      isCustomElement: (tag) => tag.startsWith('l-'),
    }),
  ],
  resolve: {
    alias: {
      common: fileURLToPath(new URL('./src/common', import.meta.url)),
      config: fileURLToPath(new URL('./src/components/config', import.meta.url)),
      custom: fileURLToPath(new URL('./src/custom', import.meta.url)),
      utils: fileURLToPath(new URL('./src/utils', import.meta.url)),
      hooks: fileURLToPath(new URL('./src/hooks', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: ['./index.ts', ...defines],
    },
  },
});
