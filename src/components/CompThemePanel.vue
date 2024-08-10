<template>
  <ClientOnly>
    <div>
      <l-tabs defaultActiveSlot="ThemeColors">
        <l-tab-item slot="ThemeColors" label="Theme Colors">
          <div
            class="grid"
            :style="{
              gridTemplateColumns: `repeat(${variants.length + 1}, 1fr)`,
            }"
          >
            <div></div>
            <template v-for="v in variants">
              <div class="gray-tip">{{ v }}</div>
            </template>
            <div class="gray-tip">accent color</div>
            <template v-for="v in variants">
              <div class="cell">
                <Component :variant="v" />
                <Component v-if="contrast" :variant="v" highContrast />
              </div>
            </template>
            <div class="gray-tip">gray color</div>
            <template v-for="v in variants">
              <div class="cell">
                <Component :variant="v" color="gray" />
                <Component v-if="contrast" :variant="v" color="gray" highContrast />
              </div>
            </template>
          </div>
        </l-tab-item>
        <l-tab-item slot="AllColors" label="All Colors">
          <div
            class="grid"
            :style="{
              gridTemplateColumns: `repeat(${variants.length + 1}, 1fr)`,
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
                  <Component :variant="v" :color="color" />
                  <Component v-if="contrast" :variant="v" :color="color" highContrast />
                </div>
              </template>
            </template>
          </div>
        </l-tab-item>
      </l-tabs>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { OpenShadowComponentKey, GlobalStaticConfig, renderElement, themeColors } from '@lun/components';
import { computed, ref, h } from 'vue';

const props = defineProps<{
  comp: OpenShadowComponentKey;
  maxSize?: number;
  props?: Record<string, any>;
  contrast?: boolean;
}>();

const variants = Array.from(GlobalStaticConfig.availableVariants[props.comp] || []) as string[];

const sizes = computed(() =>
  Array(props.maxSize || 3)
    .fill(0)
    .map((_, i) => ({
      slot: i + 1,
      label: i + 1,
    })),
);

const Component = (attrs) => h('l-' + props.comp, { ...attrs, ...props.props });
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
