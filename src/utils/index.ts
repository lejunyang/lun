import url from 'esbuild-wasm/esbuild.wasm?url';
import { isClient, isFunction } from '@lun/utils';
import * as data from './data';

const allowedImport = new Set([
  'vue',
  'react',
  'react-dom',
  'react-dom/client',
  '@lun/components',
  '@lun/core',
  '@lun/theme',
  '@lun/utils',
  'data',
]);

const dependencies = {
  vue: () => import('vue'),
  react: () => import('react'),
  'react-dom': () => import('react-dom'),
  'react-dom/client': () => import('react-dom/client'),
  '@lun/components': () => import('@lun/components'),
  '@lun/core': () => import('@lun/core'),
  '@lun/theme': () => import('@lun/theme'),
  '@lun/utils': () => import('@lun/utils'),
  data,
} as any as {
  vue: typeof import('vue');
  react: typeof import('react');
  'react-dom': typeof import('react-dom');
  'react-dom/client': typeof import('react-dom/client');
  '@lun/components': typeof import('@lun/components');
  '@lun/core': typeof import('@lun/core');
  '@lun/theme': typeof import('@lun/theme');
  '@lun/utils': typeof import('@lun/utils');
  data: typeof data;
};

const initPromise = (async () => {
  if (!isClient()) return;
  // don't load esbuild until window is loaded
  return new Promise<void>((resolve) => {
    const load = async () => {
      const { initialize } = await import('esbuild-wasm');
      await initialize({
        wasmURL: url,
      });
      window.removeEventListener('load', load);
      if (isFunction(dependencies.vue)) dependencies.vue = await dependencies.vue();
      import('../components/Editor.vue'); // trigger load Editor but don't wait it
      resolve();
    };
    window.addEventListener('load', load);
  });
})();

export async function buildDepRequire(code: string) {
  const names: string[] = [];
  const regexp = /require\(['"](.*)['"]\)/g;
  let match = regexp.exec(code);
  while (match) {
    names.push(match[1]);
    match = regexp.exec(code);
  }
  for (const name of names) {
    if (!allowedImport.has(name)) {
      throw new Error(`import "${name}" is not allowed, can be only one of ${Array.from(allowedImport).join(', ')}`);
    }
    if (isFunction(dependencies[name])) {
      dependencies[name] = await dependencies[name]();
    }
  }
  return (name: keyof typeof dependencies) => {
    return dependencies[name];
  };
}

export async function runVueTSXCode(code: string) {
  await initPromise;
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
  await initPromise;
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
  const requireDep = buildDepRequire(res.code);
  if (!res.code.includes('var result')) throw new Error(errorMsg);
  const func = new Function('require', 'createElement', 'Fragment', res.code + ';return result;');
  if (isFunction(dependencies.react)) dependencies.react = await dependencies.react();
  const { createElement, Fragment } = dependencies.react;
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
        const prop = prop1.slice(1);
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
