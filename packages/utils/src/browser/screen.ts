import { getWindow } from './dom';
import { inBrowser } from './support';

export function getDPR(element?: Element): number {
  if (!inBrowser) return 1;
  return getWindow(element).devicePixelRatio || 1;
}

const createDRP = (method: 'round' | 'floor' | 'ceil') => (value: number, element?: Element) => {
  const dpr = getDPR(element);
  return Math[method](value * dpr) / dpr;
};

export const roundByDPR = createDRP('round');
export const floorByDPR = createDRP('floor');
export const ceilByDPR = createDRP('ceil');
