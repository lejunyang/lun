<template>
  <div class="page">
    <component is="style" v-if="scopeStyle">{{ scopeStyle }}</component>
    <LazyEditor
      class="playground-editor"
      v-model="model"
      name="playground"
      :autoHeight="false"
      :editorStyle="{
        height: 'calc(100vh - var(--vp-nav-height))',
        resize: 'none',
      }"
    ></LazyEditor>
    <div class="playground-preview">
      <l-custom-renderer type="vnode" :content="content"></l-custom-renderer>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { onErrorCaptured, ref, shallowRef, watch, watchEffect } from 'vue';
import { getErrorNode, decode, encode, LazyEditor, runVueTSXCode, setActiveCodeBlock } from '../utils';
import { debounce, inBrowser } from '@lun-web/utils';
import { useBrowserLocation, useSessionStorage } from '@vueuse/core';
import { useRoute } from 'vitepress';

const locationData = useBrowserLocation(),
  session = useSessionStorage('lun-playground', '');

const route = useRoute();

const model = ref(`import { ref } from 'vue';
const model = ref("Hello, World!");
applyStyle(\`l-input { margin: 24px; }\`);
export default () => <l-input v-update={model.value}></l-input>`);

let currentHash: string | undefined = locationData.value.hash || session.value;
let data: ReturnType<typeof decode>;
const update = (newHash: string, newModel: string) => {
  currentHash = newHash;
  if (model.value !== newModel) model.value = newModel;
};
inBrowser &&
  watchEffect(() => {
    if (!route.path.includes('playground')) return;
    let { hash } = locationData.value;
    hash = hash?.slice(1);
    if (hash && hash !== currentHash && (data = decode(hash))) {
      update(hash!, data.content);
    } else if (session.value && session.value !== currentHash && (data = decode(session.value))) {
      update(session.value, data.content);
    }
  });

watch(
  model,
  debounce(() => {
    const newHash = encode(model.value);
    locationData.value.hash = newHash;
    session.value = newHash;
  }, 1000),
);

const scopeStyle = ref('');
const content = shallowRef();

const handleCodeChange = debounce(async () => {
  try {
    setActiveCodeBlock('playground', (style) => {
      scopeStyle.value = style;
    });
    const result = await runVueTSXCode(model.value);
    content.value = result.content;
    setActiveCodeBlock('');
  } catch (e: any) {
    content.value = getErrorNode(e);
  }
}, 1000);

onErrorCaptured((err) => {
  content.value = getErrorNode(err);
});

inBrowser &&
  watchEffect(() => {
    model.value;
    handleCodeChange();
  });
</script>

<style lang="scss" scoped>
.page {
  height: calc(100vh - var(--vp-nav-height));
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  container-name: playground;
  container-type: inline-size;
  & > div,
  l-spin {
    width: 50%;
    height: 100%;
    flex: 1;
  }
  l-spin {
    display: flex;
    justify-content: center;
    padding-top: 24px;
    &::part(svg) {
      font-size: 36px;
    }
  }
}
</style>
