import { defineConfig, UserConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import dts from 'vite-plugin-dts';
import { addIndexEntry } from './vitePlugin';

export function getViteConfig(name: string, viteConfig?: UserConfig) {
  const dev = process.env.NODE_ENV === 'development';
  const noType = process.env.NO_TYPE_EMIT === 'true';
  const fileName = name.replace('@', '').replace('/', '-');
  return defineConfig({
    ...viteConfig,
    plugins: [
      !dev &&
        !noType &&
        dts({
          rollupTypes: true,
          tsconfigPath: './tsconfig.build.json',
        }),
      ...(viteConfig?.plugins ?? []),
      addIndexEntry({ fileName }),
    ],
    define: {
      __DEV__: dev ? 'true' : "!!(process.env.NODE_ENV !== 'production')",
      ...viteConfig?.define,
    },
    build: {
      lib: {
        entry: './index.ts',
        name: name.replace(/[@/]\w/g, (s) => s.slice(1).toUpperCase()),
        fileName: `${fileName}.${dev ? 'development' : 'production'}`,
      },
      minify: dev ? false : 'esbuild',
      emptyOutDir: dev,
      rollupOptions: {
        external: ['vue', /@lun\/.+/],
        output: {
          globals: {
            vue: 'Vue',
            '@lun/components': 'LunComponents',
            '@lun/core': 'LunCore',
            '@lun/theme': 'LunTheme',
            '@lun/utils': 'LunUtils',
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
