import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
	define: {
		// __DEV__: "!!(process.env.NODE_ENV !== 'production')",
		__DEV__: 'true',
  },
  build: {
		lib: {
			entry: './index.ts',
			name: '@lun/utils',
			fileName: 'lun-utils',
		},
		minify: false,
		rollupOptions: {
			external: ['vue', /@lun\/.+/],
		}
	},
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
