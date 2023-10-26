import { MiddlewareState } from '@floating-ui/vue';

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
