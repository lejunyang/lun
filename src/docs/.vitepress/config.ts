import { defineConfig, DefaultTheme } from 'vitepress';
import { transformLazyShow } from 'v-lazy-show';
import locales from './locales';
import { replaceCodeTags } from './replaceCodeTags';
import viteConfig from '../../../vite.config';
import { vUpdate } from '@lun/plugins/vue';

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
      { text: locales[lang].nav.palette, link: wrapLink('/palette/', lang) },
    ],
    sidebar: {
      [wrapLink('/guides/', lang)]: [
        {
          text: locales[lang].sidebar.guides.usage,
          link: wrapLink('/guides/usage/', lang),
        },
        {
          text: locales[lang].sidebar.guides.docs,
          link: wrapLink('/guides/docs/', lang),
        },
        {
          text: locales[lang].sidebar.guides.inherit,
          link: wrapLink('/guides/inherit/', lang),
        },
        {
          text: locales[lang].sidebar.guides.attrTransform,
          link: wrapLink('/guides/attr-transform/', lang),
        },
        {
          text: locales[lang].sidebar.guides.events,
          link: wrapLink('/guides/events/', lang),
        },
        {
          text: locales[lang].sidebar.guides.breakpoints,
          link: wrapLink('/guides/breakpoints/', lang),
        },
        {
          text: locales[lang].sidebar.guides.presets,
          link: wrapLink('/guides/presets/', lang),
        },
        {
          text: locales[lang].sidebar.guides.styles,
          link: wrapLink('/guides/styles/', lang),
        },
        {
          text: locales[lang].sidebar.guides.states,
          link: wrapLink('/guides/states/', lang),
        },
        {
          text: locales[lang].sidebar.guides.caveat,
          link: wrapLink('/guides/caveat/', lang),
        },
      ],
      [wrapLink('/components/', lang)]: [
        {
          text: locales[lang].sidebar.basic.menu,
          collapsed: false,
          items: [
            process.env.NODE_ENV !== 'production' && {
              text: 'Test',
              link: wrapLink('/components/test/', lang),
            },
            { text: locales[lang].sidebar.basic.button, link: wrapLink('/components/button/', lang) },
            { text: locales[lang].sidebar.basic.icon, link: wrapLink('/components/icon/', lang) },
            { text: locales[lang].sidebar.basic.tag, link: wrapLink('/components/tag/', lang) },
          ].filter(Boolean),
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
            { text: locales[lang].sidebar.other.virtual, link: wrapLink('/components/virtual-renderer/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.dataInput.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.dataInput.checkbox, link: wrapLink('/components/checkbox/', lang) },
            { text: locales[lang].sidebar.dataInput.colorPicker, link: wrapLink('/components/color-picker/', lang) },
            { text: locales[lang].sidebar.dataInput.datePicker, link: wrapLink('/components/date-picker/', lang) },
            { text: locales[lang].sidebar.dataInput.filePicker, link: wrapLink('/components/file-picker/', lang) },
            { text: locales[lang].sidebar.dataInput.input, link: wrapLink('/components/input/', lang) },
            { text: locales[lang].sidebar.dataInput.mentions, link: wrapLink('/components/mentions/', lang) },
            { text: locales[lang].sidebar.dataInput.radio, link: wrapLink('/components/radio/', lang) },
            { text: locales[lang].sidebar.dataInput.range, link: wrapLink('/components/range/', lang) },
            { text: locales[lang].sidebar.dataInput.select, link: wrapLink('/components/select/', lang) },
            { text: locales[lang].sidebar.dataInput.switch, link: wrapLink('/components/switch/', lang) },
            { text: locales[lang].sidebar.dataInput.textarea, link: wrapLink('/components/textarea/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.dataDisplay.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.dataDisplay.calendar, link: wrapLink('/components/calendar/', lang) },
            {
              text: locales[lang].sidebar.dataDisplay.form,
              link: wrapLink('/components/form/', lang),
              collapsed: true,
              items: [
                { text: locales[lang].sidebar.dataDisplay.formItem, link: wrapLink('/components/form-item/', lang) },
              ],
            },
            // { text: locales[lang].sidebar.dataDisplay.table, link: wrapLink('/components/table/') },
          ],
        },
        {
          text: locales[lang].sidebar.pop.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.pop.dialog, link: wrapLink('/components/dialog/', lang) },
            { text: locales[lang].sidebar.pop.docPip, link: wrapLink('/components/doc-pip/', lang) },
            { text: locales[lang].sidebar.pop.message, link: wrapLink('/components/message/', lang) },
            { text: locales[lang].sidebar.pop.popover, link: wrapLink('/components/popover/', lang) },
            { text: locales[lang].sidebar.pop.tooltip, link: wrapLink('/components/tooltip/', lang) },
            { text: locales[lang].sidebar.pop.tour, link: wrapLink('/components/tour/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.feedback.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.feedback.callout, link: wrapLink('/components/callout/', lang) },
            { text: locales[lang].sidebar.feedback.progress, link: wrapLink('/components/progress/', lang) },
            { text: locales[lang].sidebar.feedback.skeleton, link: wrapLink('/components/skeleton/', lang) },
            { text: locales[lang].sidebar.feedback.spin, link: wrapLink('/components/spin/', lang) },
            { text: locales[lang].sidebar.feedback.watermark, link: wrapLink('/components/watermark/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.layout.menu,
          collapsed: false,
          items: [
            { text: locales[lang].sidebar.layout.accordion, link: wrapLink('/components/accordion/', lang) },
            { text: locales[lang].sidebar.layout.divider, link: wrapLink('/components/divider/', lang) },
            { text: locales[lang].sidebar.layout.tabs, link: wrapLink('/components/tabs/', lang) },
          ],
        },
        {
          text: locales[lang].sidebar.typography.menu,
          collapsed: false,
          items: [{ text: locales[lang].sidebar.typography.text, link: wrapLink('/components/text/', lang) }],
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
  sitemap: {
    hostname: 'https://github.com/lejunyang/lun/',
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('l-'),
        nodeTransforms: [transformLazyShow, vUpdate],
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
  head: [
    [
      'script',
      {
        type: 'speculationrules',
      },
      `{
  "prerender": [
    {
      "urls": ["/lun/components/button/", "/lun/guides/usage/"]
    }
  ]
}`,
    ],
  ],
  lastUpdated: true,
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
        lastUpdated: {
          text: '上次更新于',
          formatOptions: { dateStyle: 'medium', timeStyle: undefined, forceLocale: true },
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        lastUpdated: {
          text: 'Last updated at',
          formatOptions: { dateStyle: 'medium', timeStyle: undefined, forceLocale: true },
        },
        ...getThemeConfig('en'),
      },
    },
  },
});
