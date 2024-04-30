import { getWindow } from './dom';
import { inBrowser } from './support';

export function getDPR(element?: Element): number {
  if (!inBrowser) return 1;
  return getWindow(element).devicePixelRatio || 1;
}

export function roundByDPR(value: number, element?: Element) {
  const dpr = getDPR(element);
  return Math.round(value * dpr) / dpr;
}
