import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

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
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
