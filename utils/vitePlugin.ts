import { Plugin } from 'vite';

export function addIndexEntry({ fileName }: { fileName: string }) {
  let done = false;
  return {
    name: 'vite-plugin-add-index-entry',
    generateBundle(_, bundle) {
      if (done) return;
      done = true;
      this.emitFile({
        type: 'asset',
        fileName: 'index.js',
        needsCodeReference: false,
        source: `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${fileName}.production.js');
} else {
  module.exports = require('./${fileName}.development.js');
}`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'index.mjs',
        needsCodeReference: false,
        source: `export * from './${fileName}.development.js'`,
      });
    },
  } as Plugin;
}
