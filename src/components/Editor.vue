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
import { editor as monacoEditor, languages, Uri } from 'monaco-editor';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useData } from 'vitepress';

const editorRef = ref<HTMLElement>();
const height = ref('24px');
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  lang: {
    type: String,
    default: 'typescript',
  },
});
const { isDark } = useData();
const emits = defineEmits(['update:modelValue']);

languages.typescript.typescriptDefaults.setCompilerOptions({
  skipLibCheck: true,
  allowNonTsExtensions: true,
  allowJs: true,
});
languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: true,
});

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

let editor: monacoEditor.IStandaloneCodeEditor;

onMounted(() => {
  editor = monacoEditor.create(editorRef.value!, {
    model: monacoEditor.createModel(
      props.modelValue,
      props.lang,
      // when it's typescript, we need to specify the uri so that editor can know it's tsx
      props.lang === 'typescript' ? Uri.file('foo.tsx') : undefined
    ),
    automaticLayout: true,
    language: props.lang,
    theme: isDark.value ? 'vs-dark' : 'vs',
    readOnly: false,
    fontSize: 16,
    overviewRulerBorder: false,
    lineNumbers: 'off',
    minimap: {
      enabled: false,
    },
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

watch(isDark, (val) => {
  if (editor)
    editor.updateOptions({
      theme: val ? 'vs-dark' : 'vs',
    });
});

watch(
  () => props.lang,
  () => {
    if (editor) {
      const model = editor.getModel();
      model && monacoEditor.setModelLanguage(model, props.lang);
    }
  }
);

onBeforeUnmount(() => {
  editor.dispose();
});
</script>

<style scoped>
.wrap {
  border-radius: 0 !important;
  margin-top: 0 !important;
  border: 1px solid var(--vp-c-divider);
  border-top: none;
}
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
