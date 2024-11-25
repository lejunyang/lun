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
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';

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
  'react-error-boundary': () => import('react-error-boundary'),
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
  'react-error-boundary': typeof import('react-error-boundary');
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
      loader: __DEV__ ? () => import('../components/Editor.vue') : () => Editor,
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

export function getErrorNode(error: Error, hFactory: any = h) {
  setActiveCodeBlock('');
  console.error(error);
  return hFactory('div', { style: { width: '100%', textAlign: 'center' } }, [
    hFactory('l-icon', { name: 'error', 'data-status-color': 'error', style: { fontSize: '36px' } }),
    hFactory('pre', null, error.message),
  ]);
}

type React = typeof import('react');
export function wrapReactErrorBound(
  element: React.ReactElement,
  react: React,
  bound: typeof import('react-error-boundary'),
) {
  const { createElement } = react;
  return createElement(
    bound.ErrorBoundary,
    {
      fallbackRender: ({ error }) => getErrorNode(error, createElement),
    },
    element,
  );
}

export async function runVueTSXCode(code: string) {
  const transformedCode = await transform(code);
  const errorMsg = 'Must export a default VNode or a default function that returns a VNode';
  if (!transformedCode?.includes('exports.default')) throw new Error(errorMsg);
  const requireDep = await buildDepRequire(transformedCode);
  const { vue } = dependencies;
  const exports = {
      default: undefined as any,
    },
    React = {
      createElement: vue.h,
      Fragment: vue.Fragment,
    };
  const func = new Function('exports', 'require', 'React', 'applyStyle', transformedCode);
  func(exports, requireDep, React, applyStyle);
  const content = exports.default;
  if (!content) throw new Error(errorMsg);
  return {
    type: 'vnode',
    content: vue.isVNode(content) ? content : vue.h(content),
  };
}

export async function runReactTSXCode(code: string) {
  const transformedCode = await transform(code);
  const errorMsg = 'Must export a default ReactNode or a default function that returns a ReactNode';
  if (!transformedCode?.includes('exports.default')) throw new Error(errorMsg);
  const requireDep = await buildDepRequire(transformedCode);
  const exports = {
      default: undefined as any,
    },
    React = await loadDep('react'),
    Bound = await loadDep('react-error-boundary');
  const func = new Function('exports', 'require', 'React', 'applyStyle', transformedCode);
  func(exports, requireDep, React, applyStyle);
  const content = exports.default;
  if (!content) throw new Error(errorMsg);
  return {
    type: 'react',
    content: wrapReactErrorBound(React.isValidElement(content) ? content : React.createElement(content), React, Bound),
  };
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

// if want to load more types, consider https://github.com/microsoft/TypeScript-Website/tree/v2/packages/ata
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

export function encode(content: string, version = '01') {
  // version is useless for now, but might parse according to the version in future
  const buffer = strToU8('L' + version + content);
  const zipped = zlibSync(buffer, { level: 9 });
  const binary = strFromU8(zipped, true);
  return btoa(binary);
}

export function decode(hash?: string) {
  if (!hash) return;
  const binary = atob(hash);

  // zlib header (x78), level 9 (xDA)
  if (binary.startsWith('\x78\xDA')) {
    const buffer = strToU8(binary, true);
    const unzipped = unzlibSync(buffer);
    const text = strFromU8(unzipped),
      version = +text.slice(1, 3);
    if (text[0] === 'L' && version && Number.isInteger(version)) {
      return {
        version,
        content: text.slice(3),
      };
    }
  }
}
