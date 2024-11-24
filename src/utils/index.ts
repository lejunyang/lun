import {
  createElement,
  inBrowser,
  isConnected,
  isFunction,
  onOnce,
  supportCSSContainer,
  supportCSSLayer,
  supportCSSScope,
  withResolvers,
  once,
} from '@lun-web/utils';
import * as data from './data';
import { registerCustomRenderer } from '@lun-web/components';
import { defineAsyncComponent, h } from 'vue';
import { vUpdate } from '@lun-web/plugins/babel';

const allowedImport = new Set([
  'vue',
  'react',
  'react-dom',
  'react-dom/client',
  '@lun-web/components',
  '@lun-web/core',
  '@lun-web/theme',
  '@lun-web/utils',
  '@lun-web/react',
  'data',
]);

const dependencies = {
  vue: () => import('vue'),
  react: () => import('react'),
  'react-dom': () => import('react-dom'),
  'react-dom/client': () => import('react-dom/client'),
  '@lun-web/components': () => import('@lun-web/components'),
  '@lun-web/core': () => import('@lun-web/core'),
  '@lun-web/theme': () => import('@lun-web/theme'),
  '@lun-web/utils': () => import('@lun-web/utils'),
  '@lun-web/react': () => import('@lun-web/react'),
  data,
} as any as {
  vue: typeof import('vue');
  react: typeof import('react');
  'react-dom': typeof import('react-dom');
  'react-dom/client': typeof import('react-dom/client');
  '@lun-web/components': typeof import('@lun-web/components');
  '@lun-web/core': typeof import('@lun-web/core');
  '@lun-web/theme': typeof import('@lun-web/theme');
  '@lun-web/utils': typeof import('@lun-web/utils');
  '@lun-web/react': typeof import('@lun-web/react');
  data: typeof data;
};

const loadDep = async <N extends keyof typeof dependencies>(name: N): Promise<(typeof dependencies)[N]> => {
  if (isFunction(dependencies[name])) return (dependencies[name] = await (dependencies[name] as Function)());
  else return dependencies[name];
};

const [windowLoaded, loadResolve] = withResolvers<any>();
if (inBrowser) onOnce(window, 'load', loadResolve);

const Editor = windowLoaded.then(() => import('../components/Editor.vue'));
export const LazyEditor = inBrowser
  ? defineAsyncComponent({
      loader: () => Editor,
      loadingComponent: () => h('l-spin'),
    })
  : () => null;

const babelInit = windowLoaded.then(async () => {
  const Babel = await import('@babel/standalone');
  // @ts-ignore
  globalThis.Babel = Babel;
  await loadDep('vue');
  return Babel;
});

windowLoaded.then(async () => {
  const { isValidElement, cloneElement } = await loadDep('react');
  const { createRoot } = await loadDep('react-dom/client');
  const reactRootMap = new WeakMap();
  registerCustomRenderer('react', {
    isValidContent(content) {
      return isValidElement(content);
    },
    onMounted(content, target) {
      if (reactRootMap.has(target)) return;
      const root = createRoot(target);
      reactRootMap.set(target, root);
      root.render(content);
    },
    onUpdated(content, target) {
      reactRootMap.get(target)?.render(content);
    },
    onBeforeUnmount(target) {
      reactRootMap.get(target)?.unmount();
      reactRootMap.delete(target);
    },
    clone(content) {
      return cloneElement(content);
    },
  });
});

export async function buildDepRequire(code: string) {
  const names: string[] = [];
  const regexp = /require\(['"](.*)['"]\)/g;
  let match = regexp.exec(code);
  while (match) {
    names.push(match[1]);
    match = regexp.exec(code);
  }
  for (const _name of names) {
    const name = _name as keyof typeof dependencies;
    if (!allowedImport.has(name)) {
      throw new Error(`import "${name}" is not allowed, can be only one of ${Array.from(allowedImport).join(', ')}`);
    }
    await loadDep(name);
  }
  return (name: keyof typeof dependencies) => {
    return dependencies[name];
  };
}

let activeCodeBlock = '',
  setScopeStyle: ((style: string) => void) | undefined;
const blockStyleMap = new Map<string, HTMLStyleElement>();
export function setActiveCodeBlock(name: string, _setScopeStyle?: (style: string) => void) {
  activeCodeBlock = name;
  if (!name) return;
  setScopeStyle = _setScopeStyle;
  applyStyle(); // clear previous style
}

export function unmountCodeBlock(name: string) {
  const style = blockStyleMap.get(name);
  if (style) style.remove();
}

const setStyle = (style: string) => {
  let styleEl = blockStyleMap.get(activeCodeBlock);
  if (!styleEl) blockStyleMap.set(activeCodeBlock, (styleEl = createElement('style')));
  styleEl.textContent = style;
  if (!isConnected(styleEl)) document.head.appendChild(styleEl);
  return styleEl;
};

export function applyStyle(style?: string) {
  if (!activeCodeBlock) return;
  if (supportCSSScope && setScopeStyle) setScopeStyle(style ? `@scope {${style}}` : '');
  else if (supportCSSContainer) {
    setStyle(style ? `@container ${activeCodeBlock} (width > 0px) {${style}}` : '');
  } else if (supportCSSLayer) {
    setStyle(style ? `@layer ${activeCodeBlock} {${style}}` : '');
  } else setStyle(style || '');
}

async function transform(code: string) {
  const Babel = await babelInit;
  return Babel.transform(code, {
    presets: ['react', 'typescript'],
    filename: 'file.tsx',
    plugins: ['transform-modules-commonjs', vUpdate],
  }).code;
}

export async function runVueTSXCode(code: string) {
  const transformedCode = await transform(code);
  const errorMsg = 'Must export a default VNode or a default function that returns a VNode';
  if (!transformedCode?.includes('exports.default')) throw new Error(errorMsg);
  const requireDep = await buildDepRequire(transformedCode);
  const exports = {
      default: undefined as any,
    },
    React = {
      createElement: dependencies.vue.h,
      Fragment: dependencies.vue.Fragment,
    };
  const func = new Function('exports', 'require', 'React', 'applyStyle', transformedCode);
  func(exports, requireDep, React, applyStyle);
  if (!exports.default) throw new Error(errorMsg);
  return exports.default;
}

export async function runReactTSXCode(code: string) {
  const transformedCode = await transform(code);
  const errorMsg = 'Must export a default ReactNode or a default function that returns a ReactNode';
  if (!transformedCode?.includes('exports.default')) throw new Error(errorMsg);
  const requireDep = await buildDepRequire(transformedCode);
  const exports = {
      default: undefined as any,
    },
    React = await loadDep('react');
  const func = new Function('exports', 'require', 'React', 'applyStyle', transformedCode);
  func(exports, requireDep, React, applyStyle);
  if (!exports.default) throw new Error(errorMsg);
  return exports.default;
}

const prefix = 'https://cdn.jsdelivr.net/npm/';
const dtsLoadMap = {
  vue: prefix + 'vue/dist/vue.d.ts',
  '@vue/runtime-dom': prefix + '@vue/runtime-dom/dist/runtime-dom.d.ts',
  '@vue/reactivity': prefix + '@vue/reactivity/dist/reactivity.d.ts',
  '@vue/shared': prefix + '@vue/shared/dist/shared.d.ts',
  '@vue/runtime-core': prefix + '@vue/runtime-core/dist/runtime-core.d.ts',
  '@lun-web/components': prefix + '@lun-web/components/dist/index.d.ts',
  '@lun-web/core': prefix + '@lun-web/core/dist/index.d.ts',
  '@lun-web/theme': prefix + '@lun-web/theme/dist/index.d.ts',
  '@lun-web/utils': prefix + '@lun-web/utils/dist/index.d.ts',
  '@lun-web/react': prefix + '@lun-web/react/dist/index.d.ts',
};
export const getPackageTypes = once(async () => {
  const typeMap: Record<string, string> = {};
  await Promise.all(
    Object.entries(dtsLoadMap).map(async ([name, url]) => {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        typeMap[name] = text;
      }
    }),
  );
  return typeMap;
});
