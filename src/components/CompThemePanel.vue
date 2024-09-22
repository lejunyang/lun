<template>
  <l-tabs default-active-slot="ThemeColors">
    <l-tab-item slot="ThemeColors" :label="locales[lang]?.components.themeVariants">
      <div
        class="grid"
        :style="{
          gridTemplateColumns: `auto repeat(${variants.length}, 1fr)`,
        }"
      >
        <div></div>
        <template v-for="v in variants">
          <div class="gray-tip">{{ v }}</div>
        </template>
        <div class="gray-tip">accent color</div>
        <template v-for="v in variants">
          <div class="cell">
            <component :is="compName" v-bind="otherProps" :variant="v" />
            <component :is="compName" v-bind="otherProps" v-if="includeContrast" :variant="v" highContrast />
          </div>
        </template>
        <div class="gray-tip">gray color</div>
        <template v-for="v in variants">
          <div class="cell">
            <component :is="compName" v-bind="otherProps" :variant="v" color="gray" />
            <component :is="compName" v-bind="otherProps" v-if="includeContrast" :variant="v" color="gray" highContrast />
          </div>
        </template>
        <template v-if="includeDisabled">
          <div class="gray-tip">disabled</div>
          <template v-for="v in variants">
            <component :is="compName" v-bind="otherProps" :variant="v" color="gray" disabled />
          </template>
        </template>
      </div>
    </l-tab-item>
    <l-tab-item slot="AllColors" :label="locales[lang]?.components.colorsVariants">
      <div
        class="grid"
        :style="{
          gridTemplateColumns: `auto repeat(${variants.length}, 1fr)`,
        }"
      >
        <div></div>
        <template v-for="v in variants">
          <div class="gray-tip">{{ v }}</div>
        </template>
        <template v-for="color in themeColors">
          <div class="gray-tip">{{ color }}</div>
          <template v-for="v in variants">
            <div class="cell">
              <component :is="compName" v-bind="otherProps" :variant="v" :color="color" />
              <component
                :is="compName"
                v-bind="otherProps"
                v-if="includeContrast"
                :variant="v"
                :color="color"
                highContrast
              />
            </div>
          </template>
        </template>
      </div>
    </l-tab-item>
  </l-tabs>
</template>

<script setup lang="ts">
import { OpenShadowComponentKey, GlobalStaticConfig, renderElement, themeColors } from '@lun/components';
import { computed, ref, h } from 'vue';
import { useData } from 'vitepress';
import locales from '../docs/.vitepress/locales';

const props = defineProps<{
  comp: OpenShadowComponentKey;
  maxSize?: number;
  other?: Record<string, any>;
  includeContrast?: boolean;
  includeDisabled?: boolean;
}>();

const otherProps = computed(() => props.other || {})

const { lang } = useData();

const variants = Array.from(GlobalStaticConfig.availableVariants[props.comp] || []) as string[];

const sizes = computed(() =>
  Array(props.maxSize || 3)
    .fill(0)
    .map((_, i) => ({
      slot: i + 1,
      label: i + 1,
    })),
);

const compName = computed(() => `l-${props.comp}`);
</script>

<style scoped>
.gray-tip {
  color: var(--l-gray-9);
  font-size: 12px;
  white-space: nowrap;
}
.grid {
  display: grid;
  gap: 8px;
  justify-items: center;
  align-items: center;
}
.cell {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
