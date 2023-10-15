import { MaybePromiseOrGetter } from '@lun/core';
import { ExtractPropTypes, PropType } from 'vue';

export type SelectOptions = { label?: string; value: any }[];

export const selectProps = {
  // TODO MaybePromiseOrGetter CheckboxGroup RadioGroup
  options: { type: [Array, Function] as PropType<MaybePromiseOrGetter<SelectOptions>> },
};

export type SelectProps = ExtractPropTypes<typeof selectProps>;
