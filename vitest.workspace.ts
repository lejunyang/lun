import { defineWorkspace } from 'vitest/config';

const define = {
  __DEV__: 'true',
}
export default defineWorkspace([
  'packages/*',
  {
    define,
    test: {
      name: '@lun/components',
      globals: true,
      root: './packages/components',
      environment: 'happy-dom',
    },
  },
  {
    define,
    test: {
      name: '@lun/core',
      globals: true,
      root: './packages/core',
      environment: 'happy-dom',
    },
  },
  {
    define,
    test: {
      name: '@lun/theme',
      globals: true,
      root: './packages/theme',
      environment: 'happy-dom',
    },
  },
  {
    define,
    test: {
      name: '@lun/utils',
      globals: true,
      root: './packages/utils',
      environment: 'node',
    },
  },
  {
    define,
    test: {
      name: '@lun/babel-plugin-jsx',
      globals: true,
      root: './packages/babel-plugin-jsx',
      environment: 'node',
    },
  },
]);
