import { inBrowser } from './support';

const media = inBrowser ? /*@__PURE__*/ matchMedia('(prefers-color-scheme: dark)') : null;
export const isPreferDark = () => !!media?.matches;
