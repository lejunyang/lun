import { getViteConfig, isIIFE, isDev } from '../../utils/getViteConfig';

export default getViteConfig(isIIFE() ? '@lun-web/plugins/vue' : '@lun-web/plugins', {
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
            return `lun-web-plugins-${entryName.replace('.index', '')}.${isDev() ? 'development' : 'production'}${ext}`;
          },
        },
  },
});
