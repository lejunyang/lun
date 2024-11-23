<template>
  <div class="wrap language-html">
    <div class="editor" ref="editorRef" :style="editorStyle"></div>
    <button title="Copy" class="copy" @click="copy"></button>
  </div>
</template>

<script setup lang="ts">
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import { editor as monacoEditor, languages, Uri } from 'monaco-editor';
import { ref, onMounted, onBeforeUnmount, watch, camelize, capitalize } from 'vue';
import { useData } from 'vitepress';
import { copyText } from '@lun-web/utils';
import { shikiToMonaco } from '@shikijs/monaco';
import { createHighlighter } from 'shiki/bundle/web';
import { components } from '@lun-web/components';

const editorRef = ref<HTMLElement>();
const height = ref('24px');
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
  },
  lang: {
    type: String,
    default: 'typescript',
  },
  autoHeight: {
    type: Boolean,
    default: true,
  },
  editorStyle: {
    type: Object,
  },
});
const { isDark } = useData();
const emits = defineEmits(['update:modelValue']);

const copy = () => copyText(props.modelValue);

(async () => {
  const highlighter = await createHighlighter({
    themes: ['vitesse-dark', 'vitesse-light'],
    langs: ['typescript'],
  });
  languages.register({ id: 'typescript' });
  shikiToMonaco(highlighter, {
    editor: monacoEditor,
    languages,
  } as any);
})();

languages.typescript.typescriptDefaults.setCompilerOptions({
  skipLibCheck: true,
  allowNonTsExtensions: true,
  allowJs: true,
  strict: false,
  moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  jsx: languages.typescript.JsxEmit.Preserve,
  jsxImportSource: 'vue',
});
languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: true,
});

languages.typescript.typescriptDefaults.setExtraLibs([
  {
    content: `
/** set style for current code block. must be called in top level of current script. do not call it multiple times. */
function applyStyle(style: string): void
`,
    filePath: '',
  },
  {
    content: `import * as Vue from 'vue';
import * as LunComp from '@lun-web/components';
declare module 'vue/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      ${components
        .map(
          (comp) => `'l-${comp}': Vue.HTMLAttributes & Vue.ReservedProps & LunComp.${camelize(capitalize(comp))}Props;`,
        )
        .join('\n')}
    }
  }
}`,
  },
]);

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

let editor: monacoEditor.IStandaloneCodeEditor, model: monacoEditor.ITextModel | null;

onMounted(() => {
  const { name, lang, modelValue } = props;
  const uri = Uri.file(`${name}.${lang === 'html' ? lang : 'tsx'}`);
  model = monacoEditor.getModel(uri);
  if (!model) {
    model = monacoEditor.createModel(modelValue, lang, uri);
  } else model.setValue(modelValue);
  editor = monacoEditor.create(editorRef.value!, {
    model,
    automaticLayout: true,
    language: lang,
    theme: isDark.value ? 'vitesse-dark' : 'vitesse-light',
    readOnly: false,
    fontSize: 16,
    overviewRulerBorder: false,
    lineNumbers: 'off',
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false, // if it's true, the editor will have a one-screen size blank space at the bottom
  });
  editor.onDidChangeModelContent(() => {
    emits('update:modelValue', editor.getValue());
  });
  if (props.autoHeight) {
    const contentHeight = Math.max(editor.getContentHeight(), 48);
    height.value = `${contentHeight}px`;
  }
  editor.layout();
});

watch(
  () => props.modelValue,
  (val) => {
    if (editor && val !== editor.getValue()) {
      editor.setValue(val);
      if (props.autoHeight) {
        const contentHeight = editor.getContentHeight();
        height.value = `${contentHeight}px`;
      }
      editor.layout();
    }
  },
);

watch(isDark, (val) => {
  if (editor)
    editor.updateOptions({
      theme: val ? 'vitesse-dark' : 'vitesse-light',
    });
});

watch(
  () => props.lang,
  () => {
    if (editor) {
      const model = editor.getModel();
      model && monacoEditor.setModelLanguage(model, props.lang);
    }
  },
);

onBeforeUnmount(() => {
  model?.dispose();
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
