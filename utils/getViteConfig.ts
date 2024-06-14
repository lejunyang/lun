import { defineConfig, UserConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import dts from 'vite-plugin-dts';
import { addIndexEntry } from './vitePlugin';
import replace from '@rollup/plugin-replace';

export function getViteConfig(name: string, viteConfig?: UserConfig) {
  const dev = process.env.NODE_ENV === 'development';
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
          // beforeWriteFile(filePath, content) {
          //   if (filePath.includes('define')) return false; // don't emit type file for component define files
          //   else return { filePath, content };
          // },
        }),
      ...(viteConfig?.plugins ?? []),
      addIndexEntry({ fileName }),
    ],
    define: {
      ...viteConfig?.define,
    },
    build: {
      lib: {
        entry: './index.ts',
        name: name.replace(/[@/]\w/g, (s) => s.slice(1).toUpperCase()),
        fileName: (format, entryName) => {
          return entryName.includes('index')
            ? `${fileName}.${dev ? 'development' : 'production'}${format === 'es' ? '.js' : '.cjs'}`
            : `${entryName}.${dev ? 'development' : 'production'}${format === 'es' ? '.js' : '.cjs'}`;
        },
        ...viteConfig?.build?.lib,
      },
      minify: dev ? false : 'esbuild',
      emptyOutDir: dev,
      rollupOptions: {
        external: ['vue', /@lun\/.+/, 'react', 'dayjs'],
        output: {
          ...viteConfig?.build?.rollupOptions?.output,
          globals: {
            vue: 'Vue',
            '@lun/components': 'LunComponents',
            '@lun/core': 'LunCore',
            '@lun/theme': 'LunTheme',
            '@lun/utils': 'LunUtils',
            '@lun/plugins': 'LunPlugins',
            '@lun/react': 'LunReact',
            react: 'React',
          },
        },
      },
    },
    resolve: {
      ...viteConfig?.resolve,
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        ...viteConfig?.resolve?.alias,
      },
    },
  });
}
