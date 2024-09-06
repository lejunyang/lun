import { MaybeRefLikeOrGetter } from '../../utils';

export type UseVirtualOptions = {
  container: MaybeRefLikeOrGetter<HTMLElement>;
  disabled?: boolean | ((items: any[]) => boolean);
  overscan?: number;
  items: MaybeRefLikeOrGetter<any[]>;
  itemKey: string | ((item: any, index: number) => string | number);
  itemSize: number | ((item: any, index: number) => number);
  paddingStart?: number;
  scrollMargin?: number;
  gap?: number;
  lanes?: number;
  initialScrollOffset?: MaybeRefLikeOrGetter<number>;
};

export type UseVirtualMeasurement = {
  index: number;
  offsetStart: number;
  offsetEnd: number;
  size: number;
  key: any;
  lane: number;
};
