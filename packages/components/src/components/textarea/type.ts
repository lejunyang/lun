import { ExtractPropTypes } from 'vue';
import { GetEventPropsFromEmits, PropBoolean, PropString, Status, themeProps } from 'common';
import { baseInputProps } from '../input/type';

export const textareaProps = {
  ...baseInputProps,
  ...themeProps,
  label: PropString(),
  labelType: PropString<'float'>(),
  showLengthInfo: PropBoolean(),
  showClearIcon: PropBoolean(),
  status: PropString<Status>(),
};

export const textareaEmits = {
  update: null,
  enterDown: null,
};

export type TextareaSetupProps = ExtractPropTypes<typeof textareaProps>;
export type TextareaEvents = GetEventPropsFromEmits<typeof textareaEmits>;
export type TextareaProps = Partial<TextareaSetupProps> & TextareaEvents;
