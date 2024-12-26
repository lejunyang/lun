import { defineConfig, UserConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import dts from 'vite-plugin-dts';
import { addIndexEntry } from './vitePlugin';
import replace from '@rollup/plugin-replace';
import path from 'node:path';

const dir = path.resolve(__dirname);
export const processPath = (p: string) => path.resolve(dir, p);

export const isIIFE = () => process.env.BUILD_FORMAT === 'iife';

export const isDev = () => process.env.NODE_ENV === 'development';

const deployedOn = process.env.DEPLOYED_ON;

export function getViteConfig(
  name: string,
  { version, dtsOptions }: { version: string; dtsOptions?: Parameters<typeof dts>[0] },
  viteConfig?: UserConfig,
) {
  const iife = isIIFE();
  const dev = iife || isDev() || !!process.env.VITEST;
  const noType = deployedOn || process.env.NO_TYPE_EMIT === 'true';
  const fileName = name.replace('@', '').replace(/\//g, '-');
  return defineConfig({
    ...viteConfig,
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          __DEV__: iife && name.includes('plugins') ? 'false' : dev ? 'true' : "process.env.NODE_ENV !== 'production'",
        },
      }),
      // for package components, bundle ts file only when iife(one entrypoint), because a lot of entry points can cause out of memory when bundling ts files.
      (name.endsWith('components') ? iife && !noType : !dev && !noType) &&
        dts({
          rollupTypes: true,
          tsconfigPath: './tsconfig.build.json',
          staticImport: true,
          // bundledPackages: ['@lun-web/*'],
          rollupConfig: {},
          rollupOptions: {
            // showVerboseMessages: true,
            // showDiagnostics: true,
          },
          ...dtsOptions,
          // beforeWriteFile(filePath, content) {
          //   if (filePath.includes('define')) return false; // don't emit type file for component define files
          //   else return { filePath, content };
          // },
        }),
      ...(viteConfig?.plugins ?? []),
      !name.includes('plugin') && !iife && addIndexEntry({ fileName }),
    ],
    define: {
      ...viteConfig?.define,
    },
    css: {
      ...viteConfig?.css,
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    build: {
      ...viteConfig?.build,
      lib: {
        entry: './index.ts',
        name: name.replace(/[@/-]\w/g, (s) => s.slice(1).toUpperCase()),
        fileName: (format, entryName) => {
          if (iife) return `${fileName}.iife.js`;
          const ext = format === 'es' ? '.js' : '.cjs';
          if (entryName.includes('define')) {
            return `defines/${dev ? 'dev' : 'prod'}-${format}/${entryName}${ext}`;
          }
          return entryName.includes('index')
            ? `${fileName}.${dev ? 'development' : 'production'}${ext}`
            : `${entryName}.${dev ? 'development' : 'production'}${ext}`;
        },
        formats: iife ? ['iife'] : undefined,
        ...viteConfig?.build?.lib,
      },
      minify: dev ? false : 'esbuild',
      emptyOutDir: dev && !iife,
      rollupOptions: {
        external: iife
          ? ['vue', 'react', '@lun-web/components', '@lun-web/core', '@lun-web/utils', '@lun-web/plugins/vue']
          : ['vue', /@lun-web\/.+/, 'react', /@vue\/.+/, /^dayjs.*/, /react-dom.*/, /@floating-ui.*/],
        output: {
          chunkFileNames() {
            return `chunks/${dev ? 'dev' : 'prod'}-[format]/[name].[hash].js`;
          },
          ...viteConfig?.build?.rollupOptions?.output,
          banner: `/**
* ${name} v${version}
* Copyright (c) 2023 - present lejunyang
* @license MIT
**/`,
          globals: {
            vue: 'Vue',
            '@lun-web/components': 'LunWebComponents',
            '@lun-web/core': 'LunWebCore',
            '@lun-web/theme': 'LunWebTheme',
            '@lun-web/utils': 'LunWebUtils',
            '@lun-web/plugins': 'LunWebPlugins',
            '@lun-web/plugins/vue': 'LunWebPluginsVue',
            '@lun-web/plugins/babel': 'LunWebPluginsBabel',
            '@lun-web/react': 'LunWebReact',
            '@floating-ui/core': 'FloatingUICore',
            '@floating-ui/dom': 'FloatingUIDOM',
            '@floating-ui/utils': 'FloatingUIUtils',
            '@floating-ui/vue': 'FloatingUIVue',
            react: 'React',
          },
        },
      },
    },
    resolve: {
      ...viteConfig?.resolve,
      alias: Array.isArray(viteConfig?.resolve?.alias)
        ? viteConfig?.resolve.alias
        : {
            ...(dev && !iife
              ? {
                  '@lun-web/components': processPath('../packages/components/index'),
                  '@lun-web/utils': processPath('../packages/utils/index.ts'),
                  '@lun-web/core/date-dayjs': processPath('../packages/core/src/presets/date.dayjs.ts'),
                  '@lun-web/theme/custom': processPath('../packages/theme/src/custom/custom.ts'),
                  '@lun-web/core': processPath('../packages/core/index'),
                  '@lun-web/theme': processPath('../packages/theme/src'),
                }
              : {}),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            ...viteConfig?.resolve?.alias,
          },
    },
  });
}
