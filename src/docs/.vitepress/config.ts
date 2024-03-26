import { defineConfig, DefaultTheme } from 'vitepress';
import { transformLazyShow } from 'v-lazy-show';
import locales from './locales';
import { replaceCodeTags } from './replaceCodeTags';
import viteConfig from '../../../vite.config';
import { vUpdateForVueTemplate } from '@lun/plugins';

const wrapLink = (link: string, lang: string) => {
  if (lang === 'zh-CN') return link;
  return `/${lang}${link}`;
};

const getThemeConfig = (lang: keyof typeof locales = 'zh-CN') => {
  return {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: locales[lang].nav.home, link: wrapLink('/', lang) },
      { text: locales[lang].nav.guide, link: wrapLink('/guides/usage/', lang) },
      { text: locales[lang].nav.components, link: wrapLink('/components/button/', lang) },
    ],
    sidebar: {
      '/guides/': [
        {
          text: locales[lang].sidebar.guides.usage,
          link: wrapLink('/guides/usage/', lang),
        },
        {
          text: locales[lang].sidebar.guides.docs,
          link: wrapLink('/guides/docs/', lang),
        },
        {
          text: locales[lang].sidebar.guides.styles,
          link: wrapLink('/guides/styles/', lang),
        },
        {
          text: locales[lang].sidebar.guides.states,
          link: wrapLink('/guides/states/', lang),
        },
      ],
      '/components/': [
        {
          text: locales[lang].sidebar.basic.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.basic.button, link: wrapLink('/components/button/', lang) },
            { text: locales[lang].sidebar.basic.icon, link: wrapLink('/components/icon/', lang) },
            { text: locales[lang].sidebar.basic.tag, link: wrapLink('/components/tag/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.dataInput.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.dataInput.checkbox, link: wrapLink('/components/checkbox/', lang) },
            { text: locales[lang].sidebar.dataInput.filePicker, link: wrapLink('/components/file-picker/', lang) },
            { text: locales[lang].sidebar.dataInput.input, link: wrapLink('/components/input/', lang) },
            { text: locales[lang].sidebar.dataInput.mentions, link: wrapLink('/components/mentions/', lang) },
            { text: locales[lang].sidebar.dataInput.radio, link: wrapLink('/components/radio/', lang) },
            { text: locales[lang].sidebar.dataInput.select, link: wrapLink('/components/select/', lang) },
            { text: locales[lang].sidebar.dataInput.switch, link: wrapLink('/components/switch/', lang) },
            { text: locales[lang].sidebar.dataInput.textarea, link: wrapLink('/components/textarea/', lang) },
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
            { text: locales[lang].sidebar.pop.message, link: wrapLink('/components/message/', lang) },
            { text: locales[lang].sidebar.pop.popover, link: wrapLink('/components/popover/', lang) },
            { text: locales[lang].sidebar.pop.tooltip, link: wrapLink('/components/tooltip/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.feedback.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.feedback.callout, link: wrapLink('/components/callout/', lang) },
            { text: locales[lang].sidebar.feedback.docPip, link: wrapLink('/components/doc-pip/', lang) },
            { text: locales[lang].sidebar.feedback.progress, link: wrapLink('/components/progress/', lang) },
            { text: locales[lang].sidebar.feedback.spin, link: wrapLink('/components/spin/', lang) },
            { text: locales[lang].sidebar.feedback.watermark, link: wrapLink('/components/watermark/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.layout.menu,
          collapsed: false,
          items: [{ text: locales[lang].sidebar.layout.divider, link: wrapLink('/components/divider/', lang) }],
        },
        {
          text: locales[lang].sidebar.other.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.other.renderer, link: wrapLink('/components/custom-renderer/', lang) },
            { text: locales[lang].sidebar.other.contextConfig, link: wrapLink('/components/context-config/', lang) },
            { text: locales[lang].sidebar.other.staticConfig, link: wrapLink('/components/static-config/', lang) },
            { text: locales[lang].sidebar.other.teleport, link: wrapLink('/components/teleport-holder/', lang) },
            { text: locales[lang].sidebar.other.themeProvider, link: wrapLink('/components/theme-provider/', lang) },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/lejunyang/lun' }],
  } as DefaultTheme.Config;
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
        nodeTransforms: [transformLazyShow, vUpdateForVueTemplate],
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
  vite: viteConfig,
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
