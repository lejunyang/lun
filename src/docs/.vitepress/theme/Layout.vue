<template>
  <l-theme-provider :appearance="isDark ? 'dark' : 'light'" root v-bind="theme">
    <Layout>
      <template #nav-bar-content-after>
        <ThemeConfigPanel :theme="theme" :lang="lang" />
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

const Layout = Theme.Layout;

const theme = reactive({
  color: 'indigo',
  grayColor: 'slate',
})

const { isDark, lang } = useData();

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
</style>
