import { inBrowser } from './support';

export const isPreferDark = (() => {
  const media = inBrowser ? matchMedia('(prefers-color-scheme: dark)') : null;
  return () => !!media?.matches;
})();
