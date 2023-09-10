import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
		// __DEV__: "!!(process.env.NODE_ENV !== 'production')",
		__DEV__: 'true',
	},
})
