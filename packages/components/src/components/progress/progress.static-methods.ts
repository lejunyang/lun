import { on, raf, runIfFn } from '@lun/utils';
import { createLunElement, getFirstThemeProvider, toElement } from 'utils';
import { iProgress } from './Progress';

export const methods = {
  createPageTopProgress({
    getContainer,
    interval = 200,
    zIndex = 1000,
  }: {
    getContainer?: () => Element | string;
    interval?: number;
    zIndex?: number;
  } = {}) {
    let container: Element | null = null;
    container = toElement(runIfFn(getContainer)) || getFirstThemeProvider() || document.body;
    const progress = createLunElement('progress') as iProgress;
    let value = 0;
    Object.assign(progress, {
      type: 'page-top',
      value,
      trailerStyle: {
        zIndex,
      },
      strokeStyle: {
        transition: '0.2s linear',
      },
    });
    // TODO destroyOnDone, opacity: 0
    on(progress, 'done', () => progress.remove());
    const inc = () => {
      if (value >= 0 && value < 20) value += 1;
      else if (value >= 20 && value < 50) value += 0.4;
      else if (value >= 50 && value < 80) value += 0.2;
      else if (value >= 80 && value < 99) value += 0.05;
      progress.value = value;
    };

    container.append(progress);
    let id: any;
    return {
      start(instant = true) {
        clearInterval(id);
        progress.value = 0;
        instant && raf(inc);
        id = setInterval(inc, interval);
      },
      stop() {
        clearInterval(id);
        progress.strokeStyle = { transition: '0.2s' }; // change to ease and then stop
        progress.value = 100;
      },
    };
  },
};
