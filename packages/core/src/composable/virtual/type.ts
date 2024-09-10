import { MaybeRefLikeOrGetter } from '../../utils';

export type UseVirtualOptions = {
  container: MaybeRefLikeOrGetter<HTMLElement>;
  horizontal?: boolean;
  items?: MaybeRefLikeOrGetter<unknown[]>;
  itemKey?: string | ((item: any, index: number) => string | number);
  indexAttribute?: string;
  estimatedSize?: number | string | ((item: any, index: number) => number);
  fixedSize?: number | string | ((item: any, index: number) => number);
  disabled?: boolean | ((items: any[]) => boolean);
  overscan?:
    | number
    | string
    | null
    | [number, number]
    | ((items: any[], containerSize: number) => number | [number, number]);
  initialContainerSize?: MaybeRefLikeOrGetter<number | string>;
  observeContainerSize?: boolean;

  paddingStart?: number;
  paddingEnd?: number;
  scrollMargin?: number;
  gap?: number;
  lanes?: number;
  initialScrollOffset?: MaybeRefLikeOrGetter<number>;
  scrollEndDelay?: number;
  shouldAdjustScroll?: (measurement: UseVirtualMeasurement, delta: number, state: UseVirtualState) => boolean;
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

export type UseVirtualState = {
  scrollOffset: number;
  scrollAdjustments: number;
  scrollDirection: 'forward' | 'backward' | null;
  scrolling: boolean;
  containerSize: number;
};
