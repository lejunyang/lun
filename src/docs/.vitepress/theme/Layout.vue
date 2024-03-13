<template>
  <!-- appearance needs to be undefined when SSR -->
  <l-theme-provider :appearance="!inBrowser ? undefined : isDark ? 'dark' : 'light'" root v-bind="theme">
    <Layout>
      <template #nav-bar-content-after>
        <ThemeConfigPanel :theme="theme" :lang="lang" />
      </template>
      <template #doc-after>
        <ClientOnly>
          <Giscus
            repo="lejunyang/lun"
            repo-id="R_kgDOKRu0ww"
            mapping="pathname"
            category="Announcements"
            category-id="DIC_kwDOKRu0w84Cccsd"
            strict="0"
            reactions-enabled="1"
            emit-metadata="0"
            input-position="top"
            loading="lazy"
            :lang="lang"
            :theme="isDark ? 'dark' : 'light'"
            :key="page.filePath"
          />
        </ClientOnly>
      </template>
    </Layout>
  </l-theme-provider>
</template>
<script setup lang="ts">
import Theme from 'vitepress/theme';
import { useData, inBrowser } from 'vitepress';
import { watchEffect, nextTick, provide, reactive } from 'vue';
import ThemeConfigPanel from '../../../components/ThemeConfigPanel.vue';
import { GlobalContextConfig } from '@lun/components';
import Giscus from '@giscus/vue';

const Layout = Theme.Layout;

const theme = reactive({
  color: 'indigo',
  // grayColor: 'slate', // need to use kecab-case for SSR
  'gray-color': 'slate',
  size: '2',
  radius: 'medium',
});

const { isDark, lang, page } = useData();

const toggleAppearanceWithTransition = async () => {
  const switchButton = document.getElementById('switch-appearance');
  if (document.startViewTransition) {
    // https://akashhamirwasia.com/blog/full-page-theme-toggle-animation-with-view-transitions-api/
    await document.startViewTransition(async () => {
      isDark.value = !isDark.value;
      await nextTick();
    }).ready;
    if (!switchButton) return;
    const { top, left, width, height } = switchButton.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height + 2;
    const right = window.innerWidth - x;
    const bottom = window.innerHeight - y;
    // Calculates the radius of circle that can cover the screen
    const maxRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));
    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  } else isDark.value = !isDark.value;
};

provide('toggle-appearance', toggleAppearanceWithTransition);

watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; path=/`;
  }
  GlobalContextConfig.lang = lang.value;
});
</script>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

giscus-widget::part(iframe) {
  margin-top: 24px;
}
</style>
