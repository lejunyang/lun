<template>
  <VCustomRenderer v-bind="rendererProps"></VCustomRenderer>
  <Editor v-model="codesMap[lang]" />
</template>

<script setup lang="ts">
import Editor from './Editor.vue';
import { ref, reactive, watchEffect } from 'vue';
import { debounce, isClient } from '@lun/utils';
import { VCustomRenderer } from '@lun/components';
import { runVueJSXCode } from '../utils';

const props = defineProps({
  vue: {
    type: String,
    default: '',
  },
  html: {
    type: String,
    default: '',
  },
  react: {
    type: String,
    default: '',
  },
});
const rendererProps = reactive({
  content: undefined,
  type: undefined,
});

const lang = ref('vue');

const codesMap = reactive({
  vue: props.vue,
  html: '',
  react: '',
});

// html in slot markdown will be transformed to vue component...
// const slots = useSlots();
// const slotText = slots.default?.()[0].children;
// if (!code && isString(slotText)) {
//   code = slotText.trim();
// }

// const regex = /:::\s*(\w+)((.|\n)*?):::/g;
// let match;
// while ((match = regex.exec(code)) !== null) {
//   codesMap[match[1]] = match[2].trim();
// }

const handleCodeChange = debounce(async () => {
  try {
    switch (lang.value) {
      case 'vue':
        rendererProps.type = undefined;
        rendererProps.content = await runVueJSXCode(codesMap[lang.value]);
        break;
      case 'html':
        break;
      case 'react':
        break;
    }
  } catch (e) {
    console.error(e);
    rendererProps.type = undefined;
    rendererProps.content = `Error: ${e.message}`;
  }
}, 1000);

watchEffect(() => {
  if (codesMap[lang.value]) {
    // collect dep
  }
  if (!isClient()) return;
  handleCodeChange();
});
</script>
