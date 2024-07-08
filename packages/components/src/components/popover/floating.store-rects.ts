import { ElementRects, MiddlewareState } from '@floating-ui/vue';

declare module '@floating-ui/core' {
  interface MiddlewareData {
    rects?: ElementRects;
  }
}

declare module '@floating-ui/vue' {
  interface MiddlewareData {
    rects?: ElementRects;
  }
}

export const referenceRect = () => ({
  name: 'rects',
  fn({ x, y, rects }: MiddlewareState) {
    return {
      x,
      y,
      data: rects,
    };
  },
});
