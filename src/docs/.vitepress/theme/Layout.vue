<template>
  <l-theme-provider :appearance="isDark ? 'dark' : 'light'">
    <Layout> </Layout>
  </l-theme-provider>
</template>
<script setup lang="ts">
import Theme from 'vitepress/theme';
import { useData } from 'vitepress';
import { watchEffect } from 'vue';
import { isClient } from '@lun/utils';

const Layout = Theme.Layout;

const { isDark, lang } = useData();

watchEffect(() => {
  if (isClient()) {
    document.cookie = `nf_lang=${lang.value}; path=/`;
  }
});
</script>
