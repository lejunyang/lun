/// <reference types="vitest" />
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { vUpdate } from '@lun/plugins/babel';
import vueJsx from '@vitejs/plugin-vue-jsx';
import istanbulPlugin from 'vite-plugin-istanbul';

const processPath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

const commonAlias = {
  data: processPath('./src/utils/data.ts'),
};

const dev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  plugins: [
    vueJsx({
      isCustomElement: (tag) => tag.startsWith('l-'),
      babelPlugins: [vUpdate].filter(Boolean),
    }),
    istanbulPlugin({
      cypress: true,
      checkProd: true,
      include: ['packages/**/*'],
      exclude: ['__test__', 'packages/plugins'],
      extension: ['.ts', '.tsx'],
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
    exclude: ['@lun/components', '@lun/core', '@lun/theme', '@lun/utils', 'monaco-editor'],
  },
  ssr: {
    // fix monaco-editor bundle error, see in https://github.com/vuejs/vitepress/issues/2832
    noExternal: ['monaco-editor'],
  },
  resolve: {
    alias: dev
      ? {
          custom: processPath('./packages/components/src/custom/index'),
          common: processPath('./packages/components/src/common/index'),
          config: processPath('./packages/components/src/components/config/index'),
          utils: processPath('./packages/components/src/utils/index'),
          hooks: processPath('./packages/components/src/hooks/index'),
          '@lun/plugins/babel': processPath('./packages/plugins/src/babel/babel.index.ts'),
          '@lun/plugins/vue': processPath('./packages/plugins/src/vue/vue.index.ts'),
          '@lun/components': processPath('./packages/components/index'),
          '@lun/core/date-dayjs': processPath('./packages/core/src/presets/date.dayjs.ts'),
          '@lun/theme/custom': processPath('./packages/theme/src/custom/custom.ts'),
          '@lun/core': processPath('./packages/core/index'),
          '@lun/utils': processPath('./packages/utils/index'),
          '@lun/theme': processPath('./packages/theme/src'),
          '@lun/react': processPath('./packages/react/index'),
          ...commonAlias,
        }
      : { ...commonAlias },
  },
  css: {
    postcss: {
      // plugins: [postcssLogical()],
    },
  },
  test: {
    coverage: {
      provider: 'istanbul',
      enabled: true,
      all: false,
      clean: false,
      include: ['packages/plugins/**/*', 'packages/utils/**/*'],
      reporter: ['lcov', 'text', 'text-summary']
    },
  },
});
