<template>
  <div v-if="data" class="component-props-table">
    <template v-for="(group, gi) in data.groups" :key="group.label">
      <template v-if="group.label === 'own'">
        <div v-if="group.props.length === 0" class="component-props-empty">
          {{ data.locale === 'en' ? 'No documented props.' : '该组件无独有属性' }}
        </div>
        <l-table
          v-else
          :columns="columns"
          :data="group.props"
          :data-key="rowKey(gi)"
        />
      </template>
      <l-accordion v-else :header="group.displayLabel" :open="false">
        <l-table
          v-if="group.props.length"
          :columns="columns"
          :data="group.props"
          :data-key="rowKey(gi)"
        />
        <div v-else class="component-props-empty">
          {{ data.locale === 'en' ? 'Bag could not be resolved.' : '该 spread 暂未支持自动解析' }}
        </div>
      </l-accordion>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';

const props = defineProps<{ payload?: string }>();

const decoded = computed(() => {
  if (!props.payload) return null;
  try {
    let json: string;
    if (typeof atob === 'function') {
      // atob returns a binary (latin1) string; convert through Uint8Array to recover UTF-8
      const bin = atob(props.payload);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      json = new TextDecoder('utf-8').decode(bytes);
    } else {
      json = Buffer.from(props.payload, 'base64').toString('utf8');
    }
    return JSON.parse(json);
  } catch (e) {
    console.warn('[ComponentProps] failed to decode payload', e);
    return null;
  }
});

const data = computed(() => decoded.value as {
  locale: 'zh-CN' | 'en';
  componentName: string;
  groups: Array<{
    label: string;
    displayLabel: string;
    props: Array<{ name: string; type: string; default: string; desc: string }>;
  }>;
} | null);

const isEn = computed(() => data.value?.locale === 'en');

const columns = computed(() => [
  {
    header: isEn.value ? 'Prop' : '属性',
    name: 'name',
    width: '180px',
    renderer: ({ row }: any) =>
      h('code', { class: 'component-prop-name' }, row?.name),
  },
  {
    header: isEn.value ? 'Description' : '说明',
    name: 'desc',
    width: '1.4fr',
  },
  {
    header: isEn.value ? 'Type' : '类型',
    name: 'type',
    width: '1fr',
    renderer: ({ row }: any) =>
      h('code', { class: 'component-prop-type' }, row?.type || '—'),
  },
  {
    header: isEn.value ? 'Default' : '默认值',
    name: 'default',
    width: '0.6fr',
    renderer: ({ row }: any) =>
      h('code', { class: 'component-prop-default' }, row?.default || '—'),
  },
]);

const rowKey = (gi: number) => (item: any) => `${gi}:${item?.name ?? ''}`;
</script>

<style>
.component-props-table {
  margin: 1em 0;
  font-size: 14px;
}
.component-props-table l-table {
  width: 100%;
  margin-bottom: 12px;
}
.component-props-table l-accordion {
  margin-bottom: 12px;
}
.component-prop-name {
  font-weight: 600;
}
.component-prop-type,
.component-prop-default {
  white-space: pre-wrap;
  word-break: break-word;
}
.component-props-empty {
  padding: 12px;
  color: var(--vp-c-text-2, #888);
  font-style: italic;
}
</style>
