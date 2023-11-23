import { cacheFunctionResult } from '../function';
import { isClient } from './support';

export const isPreferDark = cacheFunctionResult(() => {
  return isClient() && window.matchMedia('(prefers-color-scheme: dark)').matches;
});
