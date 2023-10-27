<template>
  <l-theme-provider :appearance="isDark ? 'dark' : 'light'">
    <Layout> </Layout>
  </l-theme-provider>
</template>
<script setup lang="ts">
import Theme from 'vitepress/theme';
import { useData } from 'vitepress';

const Layout = Theme.Layout;

const { isDark } = useData();
</script>
