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
    search: {
      provider: 'local',
    },
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
  markdown: {
    // options for @mdit-vue/plugin-toc
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    toc: { level: [1, 2] },
  },
  vite: {
    plugins: [vueJsx()],
    define: {
      // __DEV__: "!!(process.env.NODE_ENV !== 'production')",
      __DEV__: 'true',
    },
    resolve: {
      alias: {
        // resolve to source code except for @lun/theme
        '@lun/components': fileURLToPath(new URL('../../../packages/components', import.meta.url)),
        '@lun/core': fileURLToPath(new URL('../../../packages/core', import.meta.url)),
        '@lun/utils': fileURLToPath(new URL('../../../packages/utils', import.meta.url)),
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
