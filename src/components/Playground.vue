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
import { h, ref, shallowRef, watchEffect } from 'vue';
import { LazyEditor, runVueTSXCode, setActiveCodeBlock } from '../utils';
import { debounce, isFunction, runIfFn } from '@lun-web/utils';

const model = ref(`import { ref } from 'vue';
const model = ref("Hello, World!");
applyStyle('.playground-preview { padding: 24px; }');
export default () => <l-input v-update={model.value}></l-input>`);
const scopeStyle = ref('');
const content = shallowRef();

const handleCodeChange = debounce(async () => {
  try {
    setActiveCodeBlock('playground', (style) => {
      scopeStyle.value = style;
    });
    const vContent = await runVueTSXCode(model.value);
    content.value = isFunction(vContent) ? h(vContent) : vContent;
    setActiveCodeBlock('');
    runIfFn(vContent); // run it in advance in case of error, but don't assign the result to render content, because current func is async, not able to watch and rerender
  } catch (e: any) {
    setActiveCodeBlock('');
    console.error(e);
    content.value = (
      <div style="width: 100%; text-align: center">
        <l-icon name="error" data-status-color="error" style="font-size: 36px;" />
        <pre>{e.message}</pre>
      </div>
    );
  }
}, 1000);

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
  & > div, l-spin {
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
