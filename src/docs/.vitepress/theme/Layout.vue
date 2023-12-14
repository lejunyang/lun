<template>
  <!-- no idea why wrapper Layout with l-theme-provider would cause Hydration mismatches and incorrect content rendering  -->
  <!-- <l-theme-provider :appearance="isDark ? 'dark' : 'light'" root> -->
  <component :is="inBrowser ? 'l-theme-provider' : 'div'" :appearance="isDark ? 'dark' : 'light'" root>
    <Layout>
      <template #nav-bar-content-after> </template>
    </Layout>
  </component>
  <!-- </l-theme-provider> -->
</template>
<script setup lang="ts">
import Theme from 'vitepress/theme';
import { useData, inBrowser } from 'vitepress';
import { watchEffect, nextTick, provide } from 'vue';

const Layout = Theme.Layout;

const { isDark, lang } = useData();

const toggleAppearanceWithTransition = async () => {
  // there are three switches for different screen size, find the current display one by its width
  const switchButton = Array.from(document.querySelectorAll('.VPSwitchAppearance')).find((i) => i.clientWidth);
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
      }
    );
  } else isDark.value = !isDark.value;
};

provide('toggle-appearance', toggleAppearanceWithTransition);

watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; path=/`;
  }
});
</script>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
</style>
