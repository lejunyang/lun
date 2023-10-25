import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import postcssLogical from 'postcss-logical';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['vue'],
  },
  define: {
    // __DEV__: "!!(process.env.NODE_ENV !== 'production')",
    __DEV__: 'true',
  },
  build: {
    lib: {
      entry: './index.ts',
      name: '@lun/theme',
      fileName: 'lun-theme',
    },
    minify: false,
    rollupOptions: {
      external: ['vue', /@lun\/.+/],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    postcss: {
			plugins: [postcssLogical()],
		},
    preprocessorOptions: {
      scss: {
        additionalData: `
				@use "@/scss/mixins/index" as *;
				`,
      },
    },
  },
});
