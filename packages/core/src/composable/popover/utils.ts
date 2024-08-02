import { isFunction } from '@lun/utils';

export function createPopoverRectTarget(getter: () => [x?: number, y?: number, width?: number, height?: number]): {
  getBoundingClientRect: () => DOMRect;
};

export function createPopoverRectTarget(
  x?: number,
  y?: number,
  width?: number,
  height?: number,
): { getBoundingClientRect: () => DOMRect };

export function createPopoverRectTarget(...args: any[]) {
  return {
    getBoundingClientRect: () => {
      const fArgs = isFunction(args[0]) ? args[0]() : args;
      return new DOMRect(...fArgs);
    },
  };
}
