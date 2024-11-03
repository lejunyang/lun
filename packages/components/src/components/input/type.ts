import { InputPeriod, InputPeriodWithAuto, InputType } from '@lun-web/core';
import { ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventPropsFromEmits,
  Prop,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropObjOrFunc,
  PropObjOrStr,
  PropStrOrArr,
  PropString,
  Status,
  createEmits,
  createTransitionProps,
  editStateProps,
  themeProps,
} from 'common';
import { TagProps } from '../tag/type';
import { Constructor, freeze, MaybeArray } from '@lun-web/utils';
import { AutoUpdateLabel } from './hooks';
import { GetCustomRendererSource } from '../custom-renderer';

export const baseInputProps = {
  ...editStateProps,
  value: PropString(),
  spellcheck: PropBoolean(),
  autofocus: PropBoolean(),
  placeholder: PropString(),
  required: PropBoolean(),
  type: PropString<InputType>(),
  updateWhen: PropStrOrArr<InputPeriodWithAuto | InputPeriodWithAuto[]>(),
  debounce: PropNumber(),
  throttle: PropNumber(),
  waitOptions: {},
  trim: PropBoolean(),
  maxLength: PropNumber(),
  maxTags: PropNumber(),
  restrict: PropString(RegExp),
  restrictWhen: PropStrOrArr<InputPeriod | 'beforeInput' | (InputPeriod | 'beforeInput')[]>(),
  toNullWhenEmpty: PropBoolean(),
  transform: PropFunction<(value: any) => any>(),
  transformWhen: PropStrOrArr<InputPeriod | InputPeriod[]>(),
  emitEnterDownWhenComposing: PropBoolean(),
};

export type BaseInputSetupProps = ExtractPropTypes<typeof baseInputProps>;
export type BaseInputProps = Partial<BaseInputSetupProps>;

export const inputProps = freeze({
  ...baseInputProps,
  ...themeProps,
  ...createTransitionProps('carouselLabel'),
  value: PropStrOrArr(Number as any as Constructor<number | number[]>),
  multiple: PropBoolean(),
  /** determines whether to allow duplicate tags when it's multiple input */
  unique: PropBoolean(),
  wrapTags: PropBoolean(),
  tagProps: PropObjOrFunc<((value: any, index: number) => Omit<TagProps, 'removable'>) | Omit<TagProps, 'removable'>>(),
  tagRenderer:
    Prop<GetCustomRendererSource<[value: string | number, index: number, props: Record<string, unknown>], true>>(),
  tagRemoveIcon: PropBoolean(),
  /** separator used to split current input string when it's multiple input */
  separator: PropString(RegExp),
  label: PropObjOrStr<string | AutoUpdateLabel>(),
  labelType: PropString<'float' | 'carousel'>(),
  showLengthInfo: PropBoolean(),
  showClearIcon: PropBoolean(),
  status: PropString<Status>(),
  showStatusIcon: PropBoolean(),

  // ------------------ input number ------------------
  stepControl: PropString<'up-down' | 'plus-minus' | 'none'>(),
  min: PropNumber(),
  max: PropNumber(),
  moreThan: PropNumber(),
  lessThan: PropNumber(),
  precision: PropNumber(),
  step: PropNumber(),
  strict: PropBoolean(),
  noExponent: PropBoolean(),
  replaceChPeriodMark: PropBoolean(),
  /** will normalize number in change event, meaning 1.2E2 => 120, 1.20 => 1.2 */
  normalizeNumber: PropBoolean(),
  // ------------------ input number ------------------
});

export const inputEmits = createEmits<{
  update: MaybeArray<string | number> | null;
  /** only for multiple input, emit when value of inner input updates */
  tagsComposing: string | number;
  tagsAdd: string[] | number[];
  tagsRemove: string[] | number[];
  enterDown: KeyboardEvent;
}>(['update', 'tagsComposing', 'tagsAdd', 'tagsRemove', 'enterDown']);

export type InputSetupProps = ExtractPropTypes<typeof inputProps> & CommonProps;
export type InputEvents = GetEventPropsFromEmits<typeof inputEmits>;
export type InputProps = Partial<InputSetupProps> & InputEvents;
