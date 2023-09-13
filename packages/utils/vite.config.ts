import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
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
