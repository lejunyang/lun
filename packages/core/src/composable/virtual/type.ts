import { MaybeRefLikeOrGetter } from '../../utils';

export type UseVirtualOptions = {
  container: MaybeRefLikeOrGetter<HTMLElement>;
  initialContainerSize?: MaybeRefLikeOrGetter<number>;
  observeContainerSize?: boolean;
  horizontal?: boolean;
  disabled?: boolean | ((items: any[]) => boolean);
  overscan?: number | ((items: any[], containerSize: number) => number);
  items: MaybeRefLikeOrGetter<any[]>;
  indexAttribute?: string;
  itemKey: string | ((item: any, index: number) => string | number);
  itemSize: number | ((item: any, index: number) => number);
  observeItemSize?: boolean;
  paddingStart?: number;
  scrollMargin?: number;
  gap?: number;
  lanes?: number;
  initialScrollOffset?: MaybeRefLikeOrGetter<number>;
  scrollEndDelay?: number;
};

export type UseVirtualMeasurement = {
  index: number;
  key: any;
  item: any;
  offsetStart: number;
  offsetEnd: number;
  size: number;
  lane: number;
};
