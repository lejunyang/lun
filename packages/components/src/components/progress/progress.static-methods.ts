import { on, raf, runIfFn, withResolvers } from '@lun/utils';
import { createLunElement, getFirstThemeProvider, toElement } from 'utils';
import { iProgress } from './Progress';

export const methods = {
  createPageTopProgress({
    getContainer,
    interval = 200,
    zIndex = 1000,
    destroyOnDone = true,
  }: {
    getContainer?: () => Element | string;
    interval?: number;
    zIndex?: number;
    destroyOnDone?: boolean;
  } = {}) {
    let container: Element | null = null;
    container = toElement(runIfFn(getContainer)) || getFirstThemeProvider() || document.body;
    const progress = createLunElement('progress') as iProgress;
    let value = 0;
    Object.assign(progress, {
      type: 'page-top',
      trailerStyle: {
        zIndex,
      },
    });
    const hide = () => (progress.style.cssText = `opacity: 0;transition: 0.1s;pointer-events: none;`);
    hide();
    const init = () => {
      value = 0;
      progress.style.cssText = ``;
      Object.assign(progress, {
        value,
        strokeStyle: {
          transition: '0.2s linear',
        },
      });
    };
    const inc = () => {
      if (value >= 0 && value < 20) value += 1;
      else if (value >= 20 && value < 50) value += 0.4;
      else if (value >= 50 && value < 80) value += 0.2;
      else if (value >= 80 && value < 99) value += 0.05;
      progress.value = value;
    };

    let id: any, stopResolve: any;
    on(progress, 'done', () => {
      stopResolve?.();
      stopResolve = null;
      if (destroyOnDone) progress.remove();
      else hide();
    });
    container.append(progress);
    /** returns a promise that resolves when the progress is done */
    const stop = () => {
      clearInterval(id);
      progress.strokeStyle = { transition: '0.2s' }; // change to ease and then stop
      progress.value = 100;
      const [promise, resolve] = withResolvers();
      stopResolve = resolve;
      return promise;
    };
    return {
      start(instant = true) {
        if (!progress.isConnected) return;
        clearInterval(id);
        init();
        instant && raf(inc);
        id = setInterval(inc, interval);
      },
      stop,
      destroy() {
        stop();
        progress.remove();
      },
    };
  },
};
