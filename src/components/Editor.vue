<template>
  <div class="wrap language-html">
    <div class="editor" ref="editorRef"></div>
    <button title="Copy" class="copy"></button>
  </div>
</template>

<script setup lang="ts">
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import * as monaco from 'monaco-editor';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const editorRef = ref<HTMLElement>();
const height = ref('24px');
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});
const emits = defineEmits(['update:modelValue']);

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'html') {
      return new htmlWorker();
    }
    if (['typescript', 'javascript'].includes(label)) {
      return new tsWorker();
    }
    return new EditorWorker();
  },
};

let editor: monaco.editor.IStandaloneCodeEditor;

onMounted(() => {
  editor = monaco.editor.create(editorRef.value!, {
    value: props.modelValue,
    automaticLayout: true,
    language: 'javascript',
    theme: 'vs-dark',
    foldingStrategy: 'indentation',
    renderLineHighlight: 'all',
    readOnly: false,
    fontSize: 16,
    scrollBeyondLastLine: false,
    overviewRulerBorder: false,
  });
  editor.onDidChangeModelContent(() => {
    emits('update:modelValue', editor.getValue());
  });
  const contentHeight = editor.getContentHeight();
  height.value = `${contentHeight}px`;
  editor.layout();
});

watch(
  () => props.modelValue,
  (val) => {
    if (editor && val !== editor.getValue()) {
      editor.setValue(val);
    }
  }
);

onBeforeUnmount(() => {
  editor.dispose();
});

const changeLanguage = () => {
  //  monaco.editor.setModelLanguage(editor.getModel(), language.value)
  //  editor.updateOptions({
  //           language: "objective-c"
  //       });
};
</script>

<style scoped>
.wrap:focus-within button.copy {
  display: none;
}
.editor {
  min-height: v-bind('height');
  resize: vertical;
  overflow: auto;
}
button.copy {
  width: 30px !important;
  height: 30px !important;
  z-index: 5 !important;
}
</style>
