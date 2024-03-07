import { ExtractPropTypes } from 'vue';
import { GetEventPropsFromEmits, PropBoolean, PropNumber, PropString, Status, themeProps } from 'common';
import { baseInputProps } from '../input/type';

export const textareaProps = {
  ...baseInputProps,
  ...themeProps,
  label: PropString(),
  labelType: PropString<'float'>(),
  showLengthInfo: PropBoolean(),
  showClearIcon: PropBoolean(),
  status: PropString<Status>(),

  /** rows of textarea. When autoRows is enabled, it's min rows */
  rows: PropNumber(),
  cols: PropNumber(),
  resize: PropString<'none' | 'both' | 'horizontal' | 'vertical'>(),
  autoRows: PropBoolean(),
  /** max rows of textarea, must be used with autoRows */
  maxRows: PropNumber(),
};

export const textareaEmits = {
  update: null,
  enterDown: null,
};

export type TextareaSetupProps = ExtractPropTypes<typeof textareaProps>;
export type TextareaEvents = GetEventPropsFromEmits<typeof textareaEmits>;
export type TextareaProps = Partial<TextareaSetupProps> & TextareaEvents;
