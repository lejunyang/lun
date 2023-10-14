import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/*',
  // 'tests/*/vitest.config.{e2e,unit}.ts',
  {
    test: {
      name: '@lun/components',
      globals: true,
      root: './packages/components',
      environment: 'happy-dom',
    },
  },
  {
    test: {
      name: '@lun/core',
      globals: true,
      root: './packages/core',
      environment: 'happy-dom',
    },
  },
  {
    test: {
      name: '@lun/theme',
      globals: true,
      root: './packages/theme',
      environment: 'happy-dom',
    },
  },
  {
    test: {
      name: '@lun/utils',
      globals: true,
      root: './packages/utils',
      environment: 'node',
    },
  },
]);
