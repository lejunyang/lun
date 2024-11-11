import { getViteConfig, isIIFE, isDev } from '../../utils/getViteConfig';
import json from './package.json';

export default getViteConfig(
  isIIFE() ? '@lun-web/plugins/vue' : '@lun-web/plugins',
  { version: json.version },
  {
    build: {
      lib: isIIFE()
        ? {
            name: 'LunWebPluginsVue',
            entry: './index-vue-iife.ts',
          }
        : {
            entry: ['./src/vue/vue.index.ts', './src/babel/babel.index.ts'],
            fileName: (format, entryName) => {
              const ext = format === 'es' ? '.js' : '.cjs';
              return `lun-web-plugins-${entryName.replace('.index', '')}.${
                isDev() ? 'development' : 'production'
              }${ext}`;
            },
          },
    },
  },
);
