import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './packages/components/vite.config.ts',
    test: {
      name: '@lun/components',
      globals: true,
      root: './packages/components',
      environment: 'happy-dom',
    },
  },
  {
    extends: './packages/core/vite.config.ts',
    test: {
      name: '@lun/core',
      globals: true,
      root: './packages/core',
      environment: 'happy-dom',
    },
  },
  {
    extends: './packages/theme/vite.config.ts',
    test: {
      name: '@lun/theme',
      globals: true,
      root: './packages/theme',
      environment: 'happy-dom',
    },
  },
  {
    extends: './packages/utils/vite.config.ts',
    test: {
      name: '@lun/utils',
      globals: true,
      root: './packages/utils',
      environment: 'node',
    },
  },
  {
    extends: './packages/plugins/vite.config.ts',
    test: {
      name: '@lun/plugins',
      globals: true,
      root: './packages/plugins',
      environment: 'node',
    },
  },
]);
