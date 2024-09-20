<template>
  <l-icon v-if="support != null" :name="name" :[attr]="true"></l-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  isSupportCSSStyleSheet,
  isSupportFileSystemAccess,
  isSupportSlotAssign,
  supportCSSLayer,
  supportDialog,
  supportPopover,
  supportCSSSubgrid,
  supportDocumentPictureInPicture,
  supportCSSHighLight,
  supportCSSSupports,
  supportCSSAnchor,
  isSupportCustomStateSet,
  supportCSSAutoHeightTransition,
} from '@lun/utils';

const features = {
  adoptedStyleSheets: isSupportCSSStyleSheet(),
  customState: isSupportCustomStateSet(),
  Dialog: supportDialog,
  slotAssign: isSupportSlotAssign(),
  inputCancel: 'unknown',
  popover: supportPopover,
  showOpenFilePicker: isSupportFileSystemAccess(),
  getComposedRanges: typeof Selection !== 'undefined' && 'getComposedRanges' in Selection.prototype,
  anchorPosition: supportCSSAnchor,
  layer: supportCSSLayer,
  subgrid: supportCSSSubgrid,
  color: supportCSSSupports && CSS.supports('color', 'color(display-p3 1 1 1)'),
  docPip: supportDocumentPictureInPicture,
  highlight: supportCSSHighLight,
  overflowClipMargin: supportCSSSupports && CSS.supports('overflow-clip-margin', '1px'),
  height: supportCSSAutoHeightTransition,
};

const props = defineProps<{
  is: keyof typeof features | boolean;
}>();

const support = computed(() => {
  if (typeof props.is === 'boolean') return props.is;
  return features[props.is];
});

const name = computed(() => {
  return support.value === 'unknown' ? 'help' : support.value ? 'success' : 'error';
});

const attr = computed(() => `data-${name.value}-color`);
</script>
