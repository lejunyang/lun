export function createPopoverRectTarget(x?: number, y?: number, width?: number, height?: number) {
  return {
    getBoundingClientRect: () => new DOMRect(x, y, width, height),
  };
}
