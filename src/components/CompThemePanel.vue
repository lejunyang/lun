<template>
  <Comp />
</template>

<script setup lang="tsx">
import {
  OpenShadowComponentKey,
  GlobalStaticConfig,
  themeColors,
  TabItemObject,
  renderElement,
} from '@lun-web/components';
import { computed } from 'vue';
import { useData } from 'vitepress';
import locales from '../docs/.vitepress/locales';

// no idea why using tsx it keeps reporting error if it's in template, so put it in script setup
const Comp = () => <l-tabs default-active-slot="ThemeColors" items={items} />;

const props = defineProps<{
  comp: OpenShadowComponentKey;
  maxSize?: number;
  other?: Record<string, any>;
  includeContrast?: boolean;
  includeDisabled?: boolean;
}>();

const otherProps = computed(() => props.other || {});

const { lang } = useData();

const variants = Array.from(GlobalStaticConfig.availableVariants[props.comp] || []) as string[];

// const sizes = computed(() =>
//   Array(props.maxSize || 3)
//     .fill(0)
//     .map((_, i) => ({
//       slot: i + 1,
//       label: i + 1,
//     })),
// );

const compName = props.comp;

const gridStyle = {
  display: 'grid',
  gap: '8px',
  justifyItems: 'center',
  alignItems: 'center',
  gridTemplateColumns: `auto repeat(${variants.length}, 1fr)`,
} as const;
const grayTipStyle = {
  color: 'var(--l-gray-9)',
  fontSize: '12px',
  whiteSpace: 'nowrap',
} as const;
const cellStyle = {
  display: 'flex',
  gap: '4px',
  justifyContent: 'center',
  flexWrap: 'wrap',
} as const;

const items: TabItemObject[] = [
  {
    slot: 'ThemeColors',
    label: () => locales[lang.value]?.components.themeVariants,
    panel: () => (
      <div style={gridStyle}>
        <div></div>
        {variants.map((v) => (
          <div style={grayTipStyle}>{v}</div>
        ))}
        <div style={grayTipStyle}>accent color</div>
        {variants.map((v) => (
          <div style={cellStyle}>
            {renderElement(compName, { variant: v, ...otherProps.value })}
            {props.includeContrast && renderElement(compName, { variant: v, ...otherProps.value, highContrast: true })}
          </div>
        ))}
        <div style={grayTipStyle}>gray color</div>
        {variants.map((v) => (
          <div style={cellStyle}>
            {renderElement(compName, { variant: v, ...otherProps.value, color: 'gray' })}
            {props.includeContrast &&
              renderElement(compName, { variant: v, ...otherProps.value, highContrast: true, color: 'gray' })}
          </div>
        ))}
        {props.includeDisabled && [
          <div style={grayTipStyle}>disabled</div>,
          variants.map((v) =>
            renderElement(compName, { variant: v, ...otherProps.value, color: 'gray', disabled: true }),
          ),
        ]}
      </div>
    ),
  },
  {
    slot: 'AllColors',
    label: () => locales[lang.value]?.components.colorsVariants,
    panel: () => (
      <div style={gridStyle}>
        <div></div>
        {variants.map((v) => (
          <div style={grayTipStyle}>{v}</div>
        ))}
        {themeColors.map((c) => [
          <div style={grayTipStyle}>{c}</div>,
          variants.map((v) => (
            <div style={cellStyle}>
              {renderElement(compName, { variant: v, ...otherProps.value, color: c })}
              {props.includeContrast &&
                renderElement(compName, { variant: v, ...otherProps.value, highContrast: true, color: c })}
            </div>
          )),
        ])}
      </div>
    ),
  },
];
</script>
