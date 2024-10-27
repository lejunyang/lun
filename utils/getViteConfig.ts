import { defineConfig, UserConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import dts from 'vite-plugin-dts';
import { addIndexEntry } from './vitePlugin';
import replace from '@rollup/plugin-replace';
import path from 'node:path';

const dir = path.resolve(__dirname);
export const processPath = (p: string) => path.resolve(dir, p);

export function getViteConfig(name: string, viteConfig?: UserConfig) {
  const dev = process.env.NODE_ENV === 'development' || !!process.env.VITEST;
  const noType = process.env.NO_TYPE_EMIT === 'true';
  const fileName = name.replace('@', '').replace('/', '-');
  return defineConfig({
    ...viteConfig,
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          __DEV__: dev ? 'true' : "process.env.NODE_ENV !== 'production'",
        },
      }),
      !dev &&
        !noType &&
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
          // beforeWriteFile(filePath, content) {
          //   if (filePath.includes('define')) return false; // don't emit type file for component define files
          //   else return { filePath, content };
          // },
        }),
      ...(viteConfig?.plugins ?? []),
      !name.includes('plugin') && addIndexEntry({ fileName }),
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
      lib: {
        entry: './index.ts',
        name: name.replace(/[@/]\w/g, (s) => s.slice(1).toUpperCase()),
        fileName: (format, entryName) => {
          const ext = format === 'es' ? '.js' : '.cjs';
          if (entryName.includes('define')) {
            return `defines/${dev ? 'dev' : 'prod'}-${format}/${entryName}${ext}`;
          }
          return entryName.includes('index')
            ? `${fileName}.${dev ? 'development' : 'production'}${ext}`
            : `${entryName}.${dev ? 'development' : 'production'}${ext}`;
        },
        ...viteConfig?.build?.lib,
      },
      minify: dev ? false : 'esbuild',
      emptyOutDir: dev,
      rollupOptions: {
        external: ['vue', /@lun-web\/.+/, 'react', 'dayjs', /@vue\/.+/],
        output: {
          chunkFileNames() {
            return `chunks/${dev ? 'dev' : 'prod'}-[format]/[name].[hash].js`;
          },
          ...viteConfig?.build?.rollupOptions?.output,
          globals: {
            vue: 'Vue',
            '@lun-web/components': 'LunComponents',
            '@lun-web/core': 'LunCore',
            '@lun-web/theme': 'LunTheme',
            '@lun-web/utils': 'LunUtils',
            '@lun-web/plugins': 'LunPlugins',
            '@lun-web/plugins/vue': 'LunVuePlugins',
            '@lun-web/plugins/babel': 'LunBabelPlugins',
            '@lun-web/react': 'LunReact',
            react: 'React',
          },
        },
      },
    },
    resolve: {
      ...viteConfig?.resolve,
      alias: {
        ...(dev
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
