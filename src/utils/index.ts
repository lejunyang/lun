import url from 'esbuild-wasm/esbuild.wasm?url';
import { inBrowser, isFunction, onOnce, withResolvers } from '@lun-web/utils';
import * as data from './data';
import { registerCustomRenderer } from '@lun-web/components';

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

export const LazyEditor = windowLoaded.then(() => import('../components/Editor.vue'));

const esbuildInit = windowLoaded.then(async () => {
  const { initialize } = await import('esbuild-wasm');
  await initialize({
    wasmURL: url,
  });
  await loadDep('vue');
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
      reactRootMap.get(target)?.unmount(); // TODO what will happen if unmount and then mount again?
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

export async function runVueTSXCode(code: string) {
  await esbuildInit;
  const { transform } = await import('esbuild-wasm');
  const errorMsg = 'Must export a default VNode or a default function that returns a VNode';
  const res = await transform(transformVUpdateWithRegex(code), {
    loader: 'tsx',
    format: 'iife',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxImportSource: 'vue',
    globalName: 'result', // `var result = (() => {})();`
  });
  const requireDep = await buildDepRequire(res.code);
  if (!res.code.includes('var result')) throw new Error(errorMsg);
  const func = new Function('require', 'h', 'Fragment', res.code + ';return result;');
  const result = func(requireDep, dependencies.vue.h, dependencies.vue.Fragment);
  if (!result?.default) throw new Error(errorMsg);
  return result.default;
}

export async function runReactTSXCode(code: string) {
  await esbuildInit;
  const { transform } = await import('esbuild-wasm');
  const errorMsg = 'Must export a default ReactNode or a default function that returns a ReactNode';
  const res = await transform(transformVUpdateWithRegex(code), {
    loader: 'tsx',
    format: 'iife',
    jsxFactory: 'createElement',
    jsxFragment: 'Fragment',
    jsxImportSource: 'react',
    globalName: 'result',
  });
  const requireDep = await buildDepRequire(res.code);
  if (!res.code.includes('var result')) throw new Error(errorMsg);
  const func = new Function('require', 'createElement', 'Fragment', res.code + ';return result;');
  const { createElement, Fragment } = await loadDep('react');
  const result = func(requireDep, createElement, Fragment);
  if (!result?.default) throw new Error(errorMsg);
  return result.default;
}

export function transformVUpdateWithRegex(code: string) {
  return code.replace(
    /v-update(-[a-zA-Z0-9]+)?(:[a-zA-Z0-9]+)?=\{([a-zA-Z0-9.[\]]+)\}/g,
    (_match, prop1, prop2, expr) => {
      if (prop2) {
        // v-update-xxx:xxx
        const prop = prop1?.slice(1) || 'value';
        const eventDetailMember = prop2.slice(1);
        return `${prop}={${expr}} onUpdate={(e) => ${expr} = e.detail.${eventDetailMember}}`;
      } else if (prop1) {
        // v-update-xxx
        const prop = prop1.slice(1);
        return `${prop}={${expr}} onUpdate={(e) => ${expr} = e.detail}`;
      } else {
        // v-update
        return `value={${expr}} onUpdate={(e) => ${expr} = e.detail}`;
      }
    },
  );
}
