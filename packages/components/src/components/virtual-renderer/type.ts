import { Constructor, freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  Prop,
  PropArray,
  PropBoolean,
  PropNumber,
  PropNumOrArr,
  PropNumOrFunc,
  PropStrOrFunc,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const virtualRendererProps = freeze({
  items: PropArray(),
  itemKey: PropStrOrFunc<(item: any, index: number) => string | number>(),
  estimatedSize: PropNumOrFunc<((item: any, index: number) => number) | number | string>(),
  fixedSize: PropNumOrFunc<((item: any, index: number) => number) | number | string>(),
  overscan: Prop<
    | number
    | string
    | [number, number]
    | ((items: any[], containerSize: number) => number | [number, number])
  >(),
  initialContainerSize: PropNumber(),
  observeContainerSize: PropBoolean(),
});

export const virtualRendererEmits = freeze({});

export type VirtualRendererSetupProps = ExtractPropTypes<typeof virtualRendererProps>;
export type VirtualRendererEvents = GetEventPropsFromEmits<typeof virtualRendererEmits>;
export type VirtualRendererProps = Partial<VirtualRendererSetupProps> & VirtualRendererEvents;
