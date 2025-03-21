import { freeze } from '@lun-web/utils';
import {
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  Prop,
  PropArray,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropNumOrFunc,
  PropObject,
  PropStrOrFunc,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { UseVirtualMeasurement } from '@lun-web/core';

const mainAxisProps = {
  items: PropArray(),
  itemKey: PropStrOrFunc<(item: any, index: number) => string | number>(),
  estimatedSize: PropNumOrFunc<((item: any, index: number) => number) | number | string>(),
  fixedSize: PropNumOrFunc<((item: any, index: number) => number) | number | string>(),
  overscan: Prop<
    number | string | [number, number] | ((items: any[], containerSize: number) => number | [number, number])
  >(),
  initialContainerSize: PropNumber(),
  observeContainerSize: PropBoolean(),
  gap: PropNumber(),
  lanes: PropNumber(),
};

type MainAxisProps = ExtractPropTypes<typeof mainAxisProps>;

export const virtualRendererProps = freeze({
  horizontal: PropBoolean(),
  renderer:
    PropFunction<
      (i: UseVirtualMeasurement, mainAxisItems: UseVirtualMeasurement[], crossAxisItems: UseVirtualMeasurement[]) => any
    >(),
  ...mainAxisProps,
  crossAxis: PropObject<MainAxisProps>(),
  staticPosition: PropBoolean(),
});

export const virtualRendererEmits = freeze({});

export type VirtualRendererSetupProps = ExtractPropTypes<typeof virtualRendererProps>;
export type VirtualRendererEventProps = GetEventPropsFromEmits<typeof virtualRendererEmits>;
export type VirtualRendererEventMap = GetEventMapFromEmits<typeof virtualRendererEmits>;
export type VirtualRendererProps = Partial<VirtualRendererSetupProps> & VirtualRendererEventProps;
