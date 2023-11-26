<template>
  <div class="editor" ref="editorRef"></div>
</template>

<script setup lang="ts">
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/typescript/html.worker?worker';
import * as monaco from 'monaco-editor';
import { ref, onMounted, onBeforeUnmount } from "vue";

const editorRef = ref<HTMLElement>();
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
});

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
