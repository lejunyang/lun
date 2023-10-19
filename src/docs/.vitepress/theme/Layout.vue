<template>
  <Layout> </Layout>
</template>
<script setup lang="ts">
import Theme from 'vitepress/theme';
import { useData } from 'vitepress';
import { watchEffect } from 'vue';
import { GlobalStaticConfig } from '@lun/components';

const Layout = Theme.Layout;

const { isDark } = useData();

watchEffect(() => {
  const { namespace } = GlobalStaticConfig;
  if (isDark.value) {
    document.body.classList.remove(`${namespace}-light-theme`);
    document.body.classList.add(`${namespace}-dark-theme`);
  } else {
    document.body.classList.remove(`${namespace}-dark-theme`);
    document.body.classList.add(`${namespace}-light-theme`);
  }
});
</script>
