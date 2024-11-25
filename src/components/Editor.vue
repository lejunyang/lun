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
import {
  conf,
  language,
  // @ts-ignore
} from 'monaco-editor/esm/vs/basic-languages/typescript/typescript.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';
import 'monaco-editor/esm/vs/language/html/monaco.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import {
  editor as monacoEditor,
  languages,
  Uri,
  // @ts-ignore manually import from below file, instead from editor.main.js, so that useless languages import can be avoided
} from 'monaco-editor/esm/vs/editor/edcore.main.js';
import { ref, onMounted, onBeforeUnmount, watch, camelize, capitalize } from 'vue';
import { useData } from 'vitepress';
import { copyText } from '@lun-web/utils';
import { components } from '@lun-web/components';
import {
  WorkerManager,
  LibFiles,
  SuggestAdapter,
  SignatureHelpAdapter,
  QuickInfoAdapter,
  DocumentHighlightAdapter,
  DefinitionAdapter,
  ReferenceAdapter,
  OutlineAdapter,
  RenameAdapter,
  FormatAdapter,
  FormatOnTypeAdapter,
  CodeActionAdaptor,
  InlayHintsAdapter,
  DiagnosticsAdapter,
  // @ts-ignore
} from 'monaco-editor/esm/vs/language/typescript/tsMode.js';
import { shikiToMonaco } from '@shikijs/monaco';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import lightTheme from 'shiki/themes/material-theme-lighter.mjs';
import darkTheme from 'shiki/themes/material-theme-darker.mjs';
import shikiWasm from 'shiki/wasm';
import shikiTSX from 'shiki/langs/tsx.mjs';
import shikiTS from 'shiki/langs/typescript.mjs';
import shikiHTML from 'shiki/langs/html.mjs';
import { getPackageTypes } from '../utils';

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
    default: 'tsx',
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

const getTheme = () => (isDark.value ? 'material-theme-darker' : 'material-theme-lighter');

languages.typescript.typescriptDefaults.setCompilerOptions({
  skipLibCheck: true,
  allowNonTsExtensions: true,
  allowJs: true,
  strict: false,
  moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
});
languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: true,
});

languages.typescript.typescriptDefaults.setExtraLibs([
  {
    content: `
/** injected function specially for setting style for current code block. must be called in top level of current script. do not call it multiple times. */
function applyStyle(style: string): void
`,
    filePath: 'file:///global.d.ts',
  },
]);

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'html') {
      return new htmlWorker();
    }
    if (['typescript', 'javascript', 'tsx'].includes(label)) {
      return new tsWorker();
    }
    return new EditorWorker();
  },
};

(async () => {
  const defaults = languages.typescript.typescriptDefaults;
  // register tsx as typescirpt
  languages.register({ id: 'tsx' });
  languages.setLanguageConfiguration('tsx', conf);
  languages.setMonarchTokensProvider('tsx', language);
  // copy code from node_modules\monaco-editor\esm\vs\language\typescript\tsMode.js, register these to let tsx have same features as typescript
  function asDisposable(disposables: any[]) {
    return { dispose: () => disposeAll(disposables) };
  }
  function disposeAll(disposables: any[]) {
    while (disposables.length) {
      disposables.pop().dispose();
    }
  }
  languages.onLanguage('tsx', () => {
    const modeId = 'tsx';
    const disposables = [];
    const providers: any[] = [];
    const client = new WorkerManager(modeId, defaults);
    disposables.push(client);
    const worker = (...uris: any[]) => {
      return client.getLanguageServiceWorker(...uris);
    };
    const libFiles = new LibFiles(worker);
    function registerProviders() {
      const { modeConfiguration } = defaults;
      disposeAll(providers);
      if (modeConfiguration.completionItems) {
        providers.push(languages.registerCompletionItemProvider(modeId, new SuggestAdapter(worker)));
      }
      if (modeConfiguration.signatureHelp) {
        providers.push(languages.registerSignatureHelpProvider(modeId, new SignatureHelpAdapter(worker)));
      }
      if (modeConfiguration.hovers) {
        providers.push(languages.registerHoverProvider(modeId, new QuickInfoAdapter(worker)));
      }
      if (modeConfiguration.documentHighlights) {
        providers.push(languages.registerDocumentHighlightProvider(modeId, new DocumentHighlightAdapter(worker)));
      }
      if (modeConfiguration.definitions) {
        providers.push(languages.registerDefinitionProvider(modeId, new DefinitionAdapter(libFiles, worker)));
      }
      if (modeConfiguration.references) {
        providers.push(languages.registerReferenceProvider(modeId, new ReferenceAdapter(libFiles, worker)));
      }
      if (modeConfiguration.documentSymbols) {
        providers.push(languages.registerDocumentSymbolProvider(modeId, new OutlineAdapter(worker)));
      }
      if (modeConfiguration.rename) {
        providers.push(languages.registerRenameProvider(modeId, new RenameAdapter(libFiles, worker)));
      }
      if (modeConfiguration.documentRangeFormattingEdits) {
        providers.push(languages.registerDocumentRangeFormattingEditProvider(modeId, new FormatAdapter(worker)));
      }
      if (modeConfiguration.onTypeFormattingEdits) {
        providers.push(languages.registerOnTypeFormattingEditProvider(modeId, new FormatOnTypeAdapter(worker)));
      }
      if (modeConfiguration.codeActions) {
        providers.push(languages.registerCodeActionProvider(modeId, new CodeActionAdaptor(worker)));
      }
      if (modeConfiguration.inlayHints) {
        providers.push(languages.registerInlayHintsProvider(modeId, new InlayHintsAdapter(worker)));
      }
      if (modeConfiguration.diagnostics) {
        providers.push(new DiagnosticsAdapter(libFiles, defaults, modeId, worker));
      }
    }
    registerProviders();
    disposables.push(asDisposable(providers));
    return worker;
  });
  const highlighter = await createHighlighterCore({
    themes: [darkTheme, lightTheme],
    langs: [shikiTSX, shikiTS, shikiHTML], // need 'typescript' also for type hint highlight
    engine: createOnigurumaEngine(shikiWasm),
  });
  shikiToMonaco(highlighter, {
    editor: monacoEditor,
    languages,
  } as any);
})();

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
    theme: getTheme(),
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
  getPackageTypes().then((types) => {
    for (const [name, text] of Object.entries(types)) {
      languages.typescript.typescriptDefaults.addExtraLib(text, 'file:///node_modules/' + name + '/index.d.ts');
    }
    languages.typescript.typescriptDefaults.addExtraLib(
      `
namespace JSX {
  export interface IntrinsicElements extends import('vue').NativeElements {
      ${components
        .map(
          (comp) =>
            `'l-${comp}': import('vue').HTMLAttributes & import('vue').ReservedProps & import('@lun-web/components').${camelize(
              capitalize(comp),
            )}Props;`,
        )
        .join('\n')}
  }
}`,
      'file:///packages.d.ts',
    );
  });
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

watch(isDark, () => {
  if (editor)
    editor.updateOptions({
      theme: getTheme(),
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
