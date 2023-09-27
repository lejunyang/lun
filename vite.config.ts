import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('l-'),
        },
      },
    }),
    vueJsx(),
  ],
  define: {
    // __DEV__: "!!(process.env.NODE_ENV !== 'production')",
    __DEV__: 'true',
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./packages/components/src', import.meta.url)),
			common: fileURLToPath(new URL('./packages/components/src/common', import.meta.url)),
			config: fileURLToPath(new URL('./packages/components/src/components/config', import.meta.url)),
			custom: fileURLToPath(new URL('./packages/components/src/custom', import.meta.url)),
			utils: fileURLToPath(new URL('./packages/components/src/utils', import.meta.url)),
			hooks: fileURLToPath(new URL('./packages/components/src/hooks', import.meta.url)),
		},
	},
});
