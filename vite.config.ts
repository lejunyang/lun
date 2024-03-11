import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { vUpdate } from '@lun/babel-plugin-jsx';
import vueJsx from '@vitejs/plugin-vue-jsx';

const commonAlias = {
  data: fileURLToPath(new URL('../../utils/data.ts', import.meta.url)),
};

export default defineConfig({
  plugins: [
    vueJsx({
      isCustomElement: (tag) => tag.startsWith('l-'),
      babelPlugins: [vUpdate],
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 7000,
    fs: {
      cachedChecks: false, // after upgrading vite, adding file will cause error
    },
  },
  define: {
    __DEV__: 'true',
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
  },
  optimizeDeps: {
    exclude: ['@lun/components', '@lun/core', '@lun/theme', '@lun/utils'],
  },
  ssr: {
    // fix monaco-editor bundle error, see in https://github.com/vuejs/vitepress/issues/2832
    noExternal: ['monaco-editor'],
  },
  resolve: {
    alias:
      process.env.NODE_ENV !== 'production'
        ? {
            custom: fileURLToPath(new URL('./packages/components/src/custom/index', import.meta.url)),
            common: fileURLToPath(new URL('./packages/components/src/common/index', import.meta.url)),
            config: fileURLToPath(new URL('./packages/components/src/components/config/index', import.meta.url)),
            utils: fileURLToPath(new URL('./packages/components/src/utils/index', import.meta.url)),
            hooks: fileURLToPath(new URL('./packages/components/src/hooks/index', import.meta.url)),
            '@lun/babel-plugin-jsx': fileURLToPath(new URL('./packages/babel-plugin-jsx/index', import.meta.url)),
            '@lun/components': fileURLToPath(new URL('./packages/components/index', import.meta.url)),
            '@lun/core': fileURLToPath(new URL('./packages/core/index', import.meta.url)),
            '@lun/utils': fileURLToPath(new URL('./packages/utils/index', import.meta.url)),
            '@lun/theme': fileURLToPath(new URL('./packages/theme/src', import.meta.url)),
            ...commonAlias,
          }
        : { ...commonAlias },
  },
  css: {
    postcss: {
      // plugins: [postcssLogical()],
    },
  },
});
