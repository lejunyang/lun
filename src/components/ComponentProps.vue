<template>
  <div v-if="data" class="component-props-table">
    <PropGroups :groups="data.groups" :scope="0" />

    <template v-if="data.related && data.related.length">
      <h3 class="component-props-related-title">
        {{ isEn ? 'Related Components' : '相关组件' }}
      </h3>
      <l-accordion-group multiple>
        <l-accordion
          v-for="(rel, ri) in data.related"
          :key="rel.componentName"
          :header="`<${ns}-${rel.componentName}>`"
          :open="false"
        >
          <PropGroups :groups="rel.groups" :scope="ri + 1" />
        </l-accordion>
      </l-accordion-group>
    </template>
  </div>
</template>

<script setup lang="tsx">
import { computed } from 'vue';
import { GlobalStaticConfig } from '@lun-web/components';

const props = defineProps<{ payload?: string }>();

const ns = (GlobalStaticConfig as any)?.namespace || 'l';

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

type PropEntry = { name: string; type: string; default: string; desc: string };
type Group = { label: string; displayLabel: string; props: PropEntry[] };
type Sub = { componentName: string; groups: Group[] };

const data = computed(
  () =>
    decoded.value as
      | ({ locale: 'zh-CN' | 'en'; related?: Sub[] } & Sub)
      | null,
);

const isEn = computed(() => data.value?.locale === 'en');

const columns = computed(() => [
  {
    header: isEn.value ? 'Prop' : '属性',
    name: 'name',
    width: '180px',
    renderer: ({ row }: any) => <code class="component-prop-name">{row?.name}</code>,
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
    renderer: ({ row }: any) => <code class="component-prop-type">{row?.type || '—'}</code>,
  },
  {
    header: isEn.value ? 'Default' : '默认值',
    name: 'default',
    width: '0.6fr',
    renderer: ({ row }: any) => <code class="component-prop-default">{row?.default || '—'}</code>,
  },
]);

const PropGroups = (innerProps: { groups: Group[]; scope: number }) => {
  const rowKey = (gi: number) => (item: any) => `${innerProps.scope}:${gi}:${item?.name ?? ''}`;
  const emptyText = (msg: { en: string; zh: string }) => (
    <div class="component-props-empty">{isEn.value ? msg.en : msg.zh}</div>
  );

  return (
    <>
      {innerProps.groups.map((group, gi) => {
        if (group.label === 'own') {
          if (!group.props.length)
            return emptyText({ en: 'No documented props.', zh: '该组件无独有属性' });
          return (
            <l-table
              key={`own-${gi}`}
              columns={columns.value}
              data={group.props}
              data-key={rowKey(gi)}
            />
          );
        }
        return (
          <l-accordion key={`inh-${gi}`} header={group.displayLabel} open={false}>
            {group.props.length ? (
              <l-table columns={columns.value} data={group.props} data-key={rowKey(gi)} />
            ) : (
              emptyText({ en: 'Bag could not be resolved.', zh: '该 spread 暂未支持自动解析' })
            )}
          </l-accordion>
        );
      })}
    </>
  );
};
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
.component-props-related-title {
  margin: 1.5em 0 0.75em;
  font-size: 16px;
  font-weight: 600;
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
