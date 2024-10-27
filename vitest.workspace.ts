import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './packages/components/vite.config.ts',
    test: {
      name: '@lun-web/components',
      globals: true,
      root: './packages/components',
      setupFiles: ['../../utils/testSetup.ts'], // it's relative to root, must be set here, not in vite.config.ts
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        // https://playwright.dev
        providerOptions: {},
      },
    },
  },
  {
    extends: './packages/core/vite.config.ts',
    test: {
      name: '@lun-web/core',
      globals: true,
      root: './packages/core',
      environment: 'happy-dom',
    },
  },
  {
    extends: './packages/theme/vite.config.ts',
    test: {
      name: '@lun-web/theme',
      globals: true,
      root: './packages/theme',
      environment: 'happy-dom',
    },
  },
  {
    extends: './packages/utils/vite.config.ts',
    test: {
      name: '@lun-web/utils',
      globals: true,
      root: './packages/utils',
      environment: 'node',
    },
  },
  {
    extends: './packages/plugins/vite.config.ts',
    test: {
      name: '@lun-web/plugins',
      globals: true,
      root: './packages/plugins',
      environment: 'happy-dom',
    },
  },
]);
