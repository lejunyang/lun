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
        {
          text: locales[lang].sidebar.feedback.menu,
          collapsed: false,
          items: [{ text: locales[lang].sidebar.feedback.spin, link: wrapLink('/components/spin/') }],
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
    // toc: { level: [1, 2] }, // default: [2, 3]
  },
  vite: {
    plugins: [vueJsx()],
    define: {
      // __DEV__: "!!(process.env.NODE_ENV !== 'production')",
      __DEV__: 'true',
    },
    optimizeDeps: {
      exclude: ['@lun/components', '@lun/core', '@lun/theme', '@lun/utils'],
    },
    resolve: {
      alias:
        process.env.NODE_ENV !== 'production'
          ? {
              // resolve to source code except for @lun/theme
              common: fileURLToPath(new URL('../../../packages/components/src/common/index', import.meta.url)),
              config: fileURLToPath(
                new URL('../../../packages/components/src/components/config/index', import.meta.url)
              ),
              custom: fileURLToPath(new URL('../../../packages/components/src/custom/index', import.meta.url)),
              utils: fileURLToPath(new URL('../../../packages/components/src/utils/index', import.meta.url)),
              hooks: fileURLToPath(new URL('../../../packages/components/src/hooks/index', import.meta.url)),
              '@lun/components': fileURLToPath(new URL('../../../packages/components/index', import.meta.url)),
              '@lun/core': fileURLToPath(new URL('../../../packages/core/index', import.meta.url)),
              '@lun/utils': fileURLToPath(new URL('../../../packages/utils/index', import.meta.url)),
            }
          : {},
    },
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          // zh doesn't work，should use root
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },
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
