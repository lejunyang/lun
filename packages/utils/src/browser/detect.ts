import { inBrowser } from './support';

export const isPreferDark = (() => {
  const media = inBrowser ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  return () => !!media?.matches;
})();
