<template>
  <div class="code-wrapper" :style="{ opacity: loading ? 0 : 1 }">
    <div class="code-container">
      <VCustomRenderer v-bind="rendererProps"></VCustomRenderer>
    </div>
    <div class="code-block-actions">
      <svg
        :title="show ? 'Hide code' : 'Show code'"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
        @click="show = !show"
      >
        <path
          d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"
        />
      </svg>
    </div>
    <Editor v-model="codesMap[lang]" v-lazy-show="show" />
  </div>
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
const show = ref(false);
const loading = ref(true);

const codesMap = reactive({
  vue: props.vue,
  html: '',
  react: '',
});

// html in slot markdown will be transformed to vue component...
// const slots = useSlots();
// const slotText = slots.default?.()[0].children;
// console.log('slotText', slotText, slots.default?.());
// if (!code && isString(slotText)) {
//   code = slotText.trim();
// }

// const regex = /:::\s*(\w+)((.|\n)*?):::/g;
// let match;
// while ((match = regex.exec(code)) !== null) {
//   codesMap[match[1]] = match[2].trim();
// }

const handleCodeChange = debounce(async () => {
  loading.value = true;
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
  } finally {
    loading.value = false;
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

<style lang="scss">
.code-wrapper {
  transition: all 0.3s;
}
main .code-container {
  border: 1px solid var(--vp-c-divider);
  border-bottom: none;
  padding: 26px;
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
}
.code-container + .code-container {
  margin-top: 5px;
}
.code-container.align-end {
  align-items: end;
}
.code-block-actions {
  display: flex;
  justify-content: flex-end;
  padding: 5px;
  border: 1px solid var(--vp-c-divider);
  border-top: 1px dashed var(--vp-c-divider);
  svg {
    cursor: pointer;
  }
}
</style>
