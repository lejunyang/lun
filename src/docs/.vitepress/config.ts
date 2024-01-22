import { defineConfig, DefaultTheme } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';
import vueJsx from '@vitejs/plugin-vue-jsx';
import postcssLogical from 'postcss-logical';
import { transformLazyShow } from 'v-lazy-show';
import locales from './locales';
import { replaceCodeTags } from './replaceCodeTags';
import { vUpdate } from '@lun/babel-plugin-jsx';

const wrapLink = (link: string, lang: string) => {
  if (lang === 'zh-CN') return link;
  return `/${lang}${link}`;
};

const getThemeConfig = (lang: keyof typeof locales = 'zh-CN') => {
  return {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: locales[lang].nav.home, link: wrapLink('/', lang) },
      { text: locales[lang].nav.components, link: wrapLink('/components/button/', lang) },
    ],
    sidebar: {
      '/components/': [
        {
          text: locales[lang].sidebar.basic.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.basic.button, link: wrapLink('/components/button/', lang) },
            { text: locales[lang].sidebar.basic.icon, link: wrapLink('/components/icon/', lang) },
            { text: locales[lang].sidebar.basic.renderer, link: wrapLink('/components/custom-renderer/', lang) },
            { text: locales[lang].sidebar.basic.tag, link: wrapLink('/components/tag/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.dataInput.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.dataInput.checkbox, link: wrapLink('/components/checkbox/', lang) },
            { text: locales[lang].sidebar.dataInput.input, link: wrapLink('/components/input/', lang) },
            { text: locales[lang].sidebar.dataInput.radio, link: wrapLink('/components/radio/', lang) },
            { text: locales[lang].sidebar.dataInput.select, link: wrapLink('/components/select/', lang) },
            { text: locales[lang].sidebar.dataInput.switch, link: wrapLink('/components/switch/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.ft.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.ft.form, link: wrapLink('/components/form/', lang) },
            // { text: locales[lang].sidebar.ft.table, link: wrapLink('/components/table/') },
          ],
        },
        {
          text: locales[lang].sidebar.pop.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.pop.dialog, link: wrapLink('/components/dialog/', lang) },
            { text: locales[lang].sidebar.pop.popover, link: wrapLink('/components/popover/', lang) },
            { text: locales[lang].sidebar.pop.tooltip, link: wrapLink('/components/tooltip/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.feedback.menu,
          collapsed: false,
          items: [{ text: locales[lang].sidebar.feedback.spin, link: wrapLink('/components/spin/', lang) }],
        },
        {
          text: locales[lang].sidebar.layout.menu,
          collapsed: false,
          items: [{ text: locales[lang].sidebar.layout.divider, link: wrapLink('/components/divider/', lang) }],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/lejunyang/lun' }],
  } as DefaultTheme.Config;
};

const commonAlias = {
  data: fileURLToPath(new URL('../../utils/data.ts', import.meta.url)),
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/lun/',
  title: 'Lun',
  description: 'Web components',
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('l-'),
        nodeTransforms: [transformLazyShow],
      },
    },
  },
  markdown: {
    // options for @mdit-vue/plugin-toc
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    // toc: { level: [1, 2] }, // default: [2, 3]
    preConfig(md) {
      const oldRender = md.render.bind(md);
      md.render = (src, env) => {
        const newSrc = replaceCodeTags(env.path, src);
        return oldRender(newSrc, env);
      };
    },
  },
  vite: {
    plugins: [
      vueJsx({
        isCustomElement: (tag) => tag.startsWith('l-'),
        babelPlugins: [vUpdate],
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 7000,
    },
    define: {
      __DEV__: 'true',
    },
    optimizeDeps: {
      exclude: ['@lun/components', '@lun/core', '@lun/theme', '@lun/utils'],
    },
    ssr: {
      // fix monaco-editor bundle error, see in https://github.com/vuejs/vitepress/issues/2832
      noExternal: ['monaco-editor'],
    },
    resolve: {
      alias:
        process.env.NODE_ENV !== 'production'
          ? {
              common: fileURLToPath(new URL('../../../packages/components/src/common/index', import.meta.url)),
              config: fileURLToPath(
                new URL('../../../packages/components/src/components/config/index', import.meta.url),
              ),
              custom: fileURLToPath(new URL('../../../packages/components/src/custom/index', import.meta.url)),
              utils: fileURLToPath(new URL('../../../packages/components/src/utils/index', import.meta.url)),
              hooks: fileURLToPath(new URL('../../../packages/components/src/hooks/index', import.meta.url)),
              '@lun/babel-plugin-jsx': fileURLToPath(
                new URL('../../../packages/babel-plugin-jsx/index', import.meta.url),
              ),
              '@lun/components': fileURLToPath(new URL('../../../packages/components/index', import.meta.url)),
              '@lun/core': fileURLToPath(new URL('../../../packages/core/index', import.meta.url)),
              '@lun/utils': fileURLToPath(new URL('../../../packages/utils/index', import.meta.url)),
              '@lun/theme': fileURLToPath(new URL('../../../packages/theme/src', import.meta.url)),
              ...commonAlias,
            }
          : { ...commonAlias },
    },
    css: {
      postcss: {
        plugins: [postcssLogical()],
      },
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
                  closeText: '关闭',
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
      lang: 'zh-CN',
      themeConfig: {
        ...getThemeConfig('zh-CN'),
        outline: {
          label: '大纲',
        },
        sidebarMenuLabel: '目录',
        docFooter: {
          prev: '上一页',
          next: '下一页',
        },
        darkModeSwitchLabel: '夜间模式',
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        ...getThemeConfig('en'),
      },
    },
  },
});
