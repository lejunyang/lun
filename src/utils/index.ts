// @ts-ignore
import url from 'esbuild-wasm/esbuild.wasm?url';
import { transform, initialize } from 'esbuild-wasm';
import * as vue from 'vue';
import * as components from '@lun/components';
import * as core from '@lun/core';
import * as theme from '@lun/theme';
import * as utils from '@lun/utils';
import * as react from 'react';

const allowedImport = new Set(['vue', 'react', '@lun/components', '@lun/core', '@lun/theme', '@lun/utils']);
const dependencies = {
  vue,
  react,
  '@lun/components': components,
  '@lun/core': core,
  '@lun/theme': theme,
  '@lun/utils': utils,
};

const initResult = (async () => {
  if (!utils.isClient()) {
    return;
  }
  return initialize({
    wasmURL: url,
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
  return (name: keyof typeof dependencies) => {
    if (!allowedImport.has(name)) {
      throw new Error(`import "${name}" is not allowed, can be only one of ${Array.from(allowedImport).join(', ')}`);
    }
    return dependencies[name];
  };
}

export async function runVueJSXCode(code: string) {
  await initResult;
  const errorMsg = 'Must export a default vnode or a default function that returns a vnode';
  const res = await transform(code, {
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
  const result = func(requireDep, vue.h, vue.Fragment);
  if (!result?.default) throw new Error(errorMsg);
  return result.default;
}
