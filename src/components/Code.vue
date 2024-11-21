<template>
  <ClientOnly>
    <!-- empty placeholder div -->
    <div v-if="skipRender" class="code-wrapper" style="height: 200px" ref="empty"></div>
    <div v-else-if="!devHide" class="code-wrapper" ref="wrapperRef" :style="{ containerName: props.name, containerType: 'inline-size' }">
      <!-- use component in case of vue plugin error -->
      <component is="style" v-if="scopeStyle">{{ scopeStyle }}</component>
      <div :class="`code-container`" v-if="!showGenerated || !initialized">
        <!-- this is to preventing long time white screen before initialized -->
        <slot></slot>
      </div>
      <div :class="`code-container ${loading ? 'disabled' : ''}`" v-if="showGenerated && initialized">
        <VueCustomRenderer v-bind="rendererProps"></VueCustomRenderer>
      </div>
      <div class="code-block-footer">
        <l-select
          v-update:value="lang"
          variant="ghost"
          :options="selectOptions"
          size="1"
          style="flex-grow: 0; width: 100px"
          :title="locales[userLang]?.components.codeSelect"
        />
        <div class="code-block-actions">
          <svg v-bind="commonSVGProps" @click="goToGithubSource">
            <title>{{ locales[userLang]?.components.editInGithub }}</title>
            <path
              d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
            />
            <path
              fill-rule="evenodd"
              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
            />
          </svg>
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
          <svg
            v-bind="commonSVGProps"
            v-show="isFullscreen && isSupported"
            @click="toggle"
            style="transform: scale(0.9)"
          >
            <title>{{ locales[userLang]?.components.exitFullscreen }}</title>
            <path
              d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"
            />
          </svg>
          <svg v-bind="commonSVGProps" @click="resetCode">
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
      </div>
      <Editor
        v-model="codesMap[lang]"
        v-lazy-show="showEditor"
        :name="lang + name"
        :lang="lang === 'html' ? lang : 'typescript'"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="tsx">
import {
  ref,
  reactive,
  watchEffect,
  defineAsyncComponent,
  computed,
  h,
  useTemplateRef,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { debounce, objectKeys, runIfFn, isFunction, raf } from '@lun-web/utils';
import { VueCustomRenderer } from '@lun-web/components';
import { runVueTSXCode, runReactTSXCode, LazyEditor, setActiveCodeBlock, unmountCodeBlock, applyStyle } from '../utils';
import { inBrowser, useData } from 'vitepress';
import { useFullscreen } from '@vueuse/core';
import locales from '../docs/.vitepress/locales';
import { Ref } from 'vue';
import { createElement } from 'react';
import { useIntersectionObserver } from '@lun-web/core';

const data = useData();

const userLang = data.lang as any as Ref<keyof typeof locales>;

const commonSVGProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '16',
  height: '16',
  fill: 'currentColor',
  viewBox: '0 0 16 16',
};

const Editor = inBrowser ? defineAsyncComponent(() => LazyEditor) : () => null;

const props = defineProps({
  dev: { type: Boolean },
  name: { type: String, default: '' },
  index: {
    type: Number,
    default: 0,
  },
  vueTSX: {
    type: String,
    default: '',
  },
  html: {
    type: String,
    default: '',
  },
  reactTSX: {
    type: String,
    default: '',
  },
  vueTSXPath: {
    type: String,
    default: '',
  },
  htmlPath: {
    type: String,
    default: '',
  },
  reactTSXPath: {
    type: String,
    default: '',
  },
});

// skip render those index > 5 to decrease initial render time
const skipRender = ref(props.index > 5),
  placeholderEl = useTemplateRef('empty');
useIntersectionObserver({
  targets: placeholderEl,
  disabled: () => !skipRender.value,
  callback(entries, ob) {
    if (entries[0]?.isIntersecting) {
      skipRender.value = false;
      ob.disconnect();
    }
  },
});
onMounted(() => {
  if (skipRender.value) {
    raf(() => (skipRender.value = false), (props.index - 5) * 10);
  }
});

const devHide = computed(() => props.dev && inBrowser && location.hostname !== 'localhost');

const lang = ref('vueTSX');
const showEditor = ref(false);
const loading = ref(true);
const initialized = ref(false);
const showGenerated = ref(false);
const selectOptions = [
  { label: 'Vue TSX', value: 'vueTSX' },
  { label: 'React TSX', value: 'reactTSX' },
  { label: 'HTML', value: 'html' },
];

const codesMap = reactive({
  vueTSX: props.vueTSX,
  html: props.html,
  reactTSX: props.reactTSX,
} as Record<string, string>);

const resetCode = () => {
  objectKeys(codesMap).forEach((key) => {
    codesMap[key] = (props as any)[key];
  });
  rendererProps.key = Date.now();
  if (initialized.value) {
    showGenerated.value = true;
    handleCodeChange();
  }
};

const goToGithubSource = () => {
  const fileName = (props as any)[`${lang.value}Path`];
  const path = data.page.value.relativePath.split('/').slice(0, -1).join('/');
  if (fileName) window.open(`https://github.com/lejunyang/lun/blob/main/src/docs/${path}/${fileName}`, '_blank');
};

const rendererProps = reactive({
  content: undefined as any,
  type: undefined as any,
  preferHtml: true,
  key: undefined as any,
});

const scopeStyle = ref('');
const handleCodeChange = debounce(async () => {
  try {
    const code = codesMap[lang.value];
    if (!code) {
      rendererProps.type = 'vnode';
      rendererProps.content = (
        <div style="width: 100%; text-align: center">
          <l-icon name="warning" data-status-color="warning" style="font-size: 36px;" />
          <pre>{locales[userLang.value]?.components.noUseCase}</pre>
        </div>
      );
      return;
    }
    setActiveCodeBlock(props.name, (style) => {
      scopeStyle.value = style;
    });
    switch (lang.value) {
      case 'vueTSX':
        const vContent = await runVueTSXCode(code);
        rendererProps.content = isFunction(vContent) ? h(vContent) : vContent;
        rendererProps.type = 'vnode';
        break;
      case 'html':
        rendererProps.type = 'html';
        rendererProps.content = code;
        break;
      case 'reactTSX':
        const rContent = await runReactTSXCode(code);
        rendererProps.content = isFunction(rContent) ? createElement(rContent) : rContent;
        rendererProps.type = 'react';
        break;
    }
    setActiveCodeBlock('');
    rendererProps.key = Date.now(); // force to refresh, or vue may reuse old vnode content and cause some issues
    runIfFn(rendererProps.content); // run it in advance in case of error, but don't assign the result to render content, because current func is async, not able to watch and rerender
  } catch (e: any) {
    console.error(e);
    rendererProps.type = 'vnode';
    rendererProps.content = (
      <div style="width: 100%; text-align: center">
        <l-icon name="error" data-status-color="error" style="font-size: 36px;" />
        <pre>{e.message}</pre>
      </div>
    );
  } finally {
    loading.value = false;
    initialized.value = true;
  }
}, 1000);

onBeforeUnmount(() => unmountCodeBlock(props.name));

const preCode = codesMap[lang.value];
watchEffect(() => {
  if (!inBrowser) return;
  const nowCode = codesMap[lang.value];
  if (nowCode !== preCode) {
    showGenerated.value = true;
  }
  loading.value = true;
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

  &.disabled {
    opacity: 0.7;
    pointer-events: none;
  }

  .container {
    flex-basis: 100%;
    display: flex;
    gap: 5px;
    &.center {
      justify-content: center;
      align-items: center;
    }
    &.column {
      flex-direction: column;
    }
  }

  .align-end {
    align-items: end;
  }

  .w-full {
    width: 100%;
  }
  .h-full {
    height: 100%;
  }
}

.code-block-footer {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  border: 1px solid var(--vp-c-divider);
  border-top: 1px dashed var(--vp-c-divider);
}

.code-block-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 7px;
  svg {
    cursor: pointer;
  }
}
</style>
