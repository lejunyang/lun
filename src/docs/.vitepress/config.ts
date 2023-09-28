import { defineConfig, DefaultTheme } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';
import vueJsx from '@vitejs/plugin-vue-jsx';
import locales from './locales';

const wrapLink = (link: string, lang: string = 'zh') => {
  if (lang === 'zh') return link;
  else return `/${lang}${link}`;
};

const getThemeConfig = (lang: keyof typeof locales = 'zh') => {
  return {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: locales[lang].nav.home, link: wrapLink('/') },
      { text: locales[lang].nav.components, link: wrapLink('/components/') },
    ],
    sidebar: {
      '/components/': [
        {
          text: locales[lang].sidebar.basic.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.basic.button, link: wrapLink('/components/button/') },
            { text: locales[lang].sidebar.basic.icon, link: wrapLink('/components/icon/') },
            { text: locales[lang].sidebar.basic.baseInput, link: wrapLink('/components/base-input/') },
            { text: locales[lang].sidebar.basic.input, link: wrapLink('/components/input/') },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/lejunyang/lun' }],
  } as DefaultTheme.Config;
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Lun',
  description: 'Web components',
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('l-'),
      },
    },
  },
  vite: {
    plugins: [vueJsx()],
    define: {
      // __DEV__: "!!(process.env.NODE_ENV !== 'production')",
      __DEV__: 'true',
    },
    optimizeDeps: {
      exclude: ['@lun/components', '@lun/core', '@lun/theme', '@lun/utils']
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../../packages/components/src', import.meta.url)),
        common: fileURLToPath(new URL('../../../packages/components/src/common', import.meta.url)),
        config: fileURLToPath(new URL('../../../packages/components/src/components/config', import.meta.url)),
        custom: fileURLToPath(new URL('../../../packages/components/src/custom', import.meta.url)),
        utils: fileURLToPath(new URL('../../../packages/components/src/utils', import.meta.url)),
        hooks: fileURLToPath(new URL('../../../packages/components/src/hooks', import.meta.url)),
      },
    },
  },
  locales: {
    root: {
      label: '中文',
      lang: 'zh',
      themeConfig: getThemeConfig('zh'),
    },
    en: {
      label: 'English',
      lang: 'en',
      themeConfig: getThemeConfig('en'),
    },
  },
});
