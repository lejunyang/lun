<template>
  <div class="code-wrapper">
    <div class="code-container" v-show="!initialized">
      <!-- this is to preventing long time white screen before initialized -->
      <slot></slot>
    </div>
    <div class="code-container" v-show="initialized" :style="{ opacity: loading ? 0.7 : 1 }">
      <VCustomRenderer v-bind="rendererProps"></VCustomRenderer>
    </div>
    <div class="code-block-actions">
      <svg
        :title="showEditor ? 'Hide code' : 'Show code'"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
        @click="showEditor = !showEditor"
      >
        <path
          d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"
        />
      </svg>
    </div>
    <Editor v-model="codesMap[lang]" v-lazy-show="showEditor" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watchEffect, defineAsyncComponent } from 'vue';
import { debounce } from '@lun/utils';
import { VCustomRenderer } from '@lun/components';
import { runVueJSXCode } from '../utils';
import { inBrowser } from 'vitepress';

const Editor = inBrowser ? defineAsyncComponent(() => import('./Editor.vue')) : () => null;

const props = defineProps({
  vueJSX: {
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

const lang = ref('vueJSX');
const showEditor = ref(false);
const loading = ref(true);
const initialized = ref(false);

const codesMap = reactive({
  vueJSX: props.vueJSX,
  html: '',
  react: '',
} as Record<string, string>);

const rendererProps = reactive({
  content: undefined as any,
  type: undefined as any,
});

const handleCodeChange = debounce(async () => {
  loading.value = true;
  try {
    switch (lang.value) {
      case 'vueJSX':
        rendererProps.type = undefined;
        rendererProps.content = await runVueJSXCode(codesMap[lang.value]);
        break;
      case 'html':
        break;
      case 'react':
        break;
    }
  } catch (e: any) {
    console.error(e);
    rendererProps.type = undefined;
    rendererProps.content = `Error: ${e.message}`;
  } finally {
    loading.value = false;
    initialized.value = true;
  }
}, 1000);

watchEffect(() => {
  if (codesMap[lang.value]) {
    // collect dep
  }
  if (!inBrowser) return;
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
  .container {
    flex-basis: 100%;
  }
  .align-end {
    align-items: end;
  }
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
