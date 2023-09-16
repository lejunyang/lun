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
	optimizeDeps: {
		exclude: ['vue'],
	},
	define: {
		// __DEV__: "!!(process.env.NODE_ENV !== 'production')",
		__DEV__: 'true',
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			common: fileURLToPath(new URL('./src/common', import.meta.url)),
			config: fileURLToPath(new URL('./src/components/config', import.meta.url)),
			custom: fileURLToPath(new URL('./src/custom', import.meta.url)),
			utils: fileURLToPath(new URL('./src/utils', import.meta.url)),
			hooks: fileURLToPath(new URL('./src/hooks', import.meta.url)),
		},
	},
	css: {
		// css预处理器
		preprocessorOptions: {
			scss: {
				// 引入 mixin.scss 这样就可以在全局中使用 mixin.scss中预定义的变量了
				// 给导入的路径最后加上 ;
				// additionalData: '@import "@/assets/style/mixin.scss";',
			},
		},
	},
});
