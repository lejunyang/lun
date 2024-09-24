import { getViteConfig } from '../../utils/getViteConfig';

const dev = process.env.NODE_ENV === 'development';
export default getViteConfig('@lun/plugins', {
  build: {
    lib: {
      entry: ['./src/vue/vue.index.ts', './src/babel/babel.index.ts'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? '.js' : '.cjs';
        return `lun-plugins-${entryName.replace('.index', '')}.${dev ? 'development' : 'production'}${ext}`;
      },
    },
  },
});
