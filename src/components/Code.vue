<template>
  <ClientOnly>
    <div class="code-wrapper" v-show="!devHide" ref="wrapperRef">
      <div class="code-container" v-if="!initialized">
        <!-- this is to preventing long time white screen before initialized -->
        <slot></slot>
      </div>
      <div class="code-container" v-show="initialized" :style="{ opacity: loading ? 0.7 : 1 }">
        <VCustomRenderer v-bind="rendererProps"></VCustomRenderer>
      </div>
      <div class="code-block-actions">
        <svg
          v-bind="commonSVGProps"
          v-show="!isFullscreen && isSupported"
          @click="toggle"
          style="transform: scale(0.9)"
        >
          <title>{{ locales[userLang]?.components.enterFullscreen }}</title>
          <path
            fill-rule="evenodd"
            d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707zm0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707m-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707"
          />
        </svg>
        <svg v-bind="commonSVGProps" v-show="isFullscreen && isSupported" @click="toggle" style="transform: scale(0.9)">
          <title>{{ locales[userLang]?.components.exitFullscreen }}</title>
          <path
            d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"
          />
        </svg>
        <svg v-bind="commonSVGProps" @click="resetCodes">
          <title>{{ locales[userLang]?.components.resetCode }}</title>
          <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
          <path
            d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"
          />
        </svg>
        <svg v-bind="commonSVGProps" @click="showEditor = !showEditor">
          <title>
            {{ showEditor ? locales[userLang]?.components.hideCode : locales[userLang]?.components.showCode }}
          </title>
          <path
            d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"
          />
        </svg>
      </div>
      <Editor v-model="codesMap[lang]" v-lazy-show="showEditor" />
    </div>
  </ClientOnly>
</template>

<script setup lang="tsx">
import { ref, reactive, watchEffect, defineAsyncComponent, computed } from 'vue';
import { debounce, runIfFn } from '@lun/utils';
import { VCustomRenderer } from '@lun/components';
import { runVueTSXCode, runReactTSXCode } from '../utils';
import { inBrowser, useData } from 'vitepress';
import { useFullscreen } from '@vueuse/core';
import locales from '../docs/.vitepress/locales';

const data = useData();
const userLang = data.lang as any as keyof typeof locales;

const commonSVGProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '16',
  height: '16',
  fill: 'currentColor',
  viewBox: '0 0 16 16',
};

const Editor = inBrowser ? defineAsyncComponent(() => import('./Editor.vue')) : () => null;

const props = defineProps({
  dev: { type: Boolean },
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

const devHide = computed(() => props.dev && inBrowser && !location.search.includes('dev'));

const lang = ref('vueJSX');
const showEditor = ref(false);
const loading = ref(true);
const initialized = ref(false);

const codesMap = reactive({
  vueJSX: props.vueJSX,
  html: props.html,
  react: props.react,
} as Record<string, string>);

const resetCodes = () => {
  Object.keys(codesMap).forEach((key) => {
    codesMap[key] = props[key];
  });
  rendererProps.key = Date.now();
};

const rendererProps = reactive({
  content: undefined as any,
  type: undefined as any,
  preferHtml: true,
  key: 1,
});

const handleCodeChange = debounce(async () => {
  loading.value = true;
  try {
    const code = codesMap[lang.value];
    switch (lang.value) {
      case 'vueJSX':
        rendererProps.content = await runVueTSXCode(code);
        rendererProps.type = 'vnode';
        break;
      case 'html':
        rendererProps.type = 'html';
        rendererProps.content = code;
        break;
      case 'react':
        rendererProps.content = await runReactTSXCode(code);
        rendererProps.type = 'react';
        break;
    }
    rendererProps.key = Date.now(); // force to refresh, or vue may reuse old vnode content and cause some issues
    runIfFn(rendererProps.content); // run it in advance in case of error, but don't assign the result to render content, because current func is async, not able to watch and rerender
  } catch (e: any) {
    console.error(e);
    rendererProps.type = 'vnode';
    rendererProps.content = (
      <div style="width: 100%; text-align: center">
        <l-icon name="error" style="color: red; font-size: 36px;" />
        <pre>{e.message}</pre>
      </div>
    );
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

const wrapperRef = ref<HTMLElement>();
const { isFullscreen, toggle, isSupported } = useFullscreen(wrapperRef);
</script>

<style lang="scss">
.code-wrapper {
  transition: all 0.3s;
  background-color: var(--l-color-background);

  pre {
    white-space: pre-line;
  }
}

main .code-container {
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-bottom: none;
  padding: 26px;
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;

  .container {
    flex-basis: 100%;
    display: flex;
    gap: 5px;
  }

  .align-end {
    align-items: end;
  }

  .w-full {
    width: 100%;
  }
}

.code-block-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px;
  border: 1px solid var(--vp-c-divider);
  border-top: 1px dashed var(--vp-c-divider);
  gap: 5px;

  svg {
    cursor: pointer;
  }
}
</style>
