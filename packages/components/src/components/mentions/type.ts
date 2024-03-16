import { ExtractPropTypes } from 'vue';
import { GetEventPropsFromEmits, PropBoolean, PropNumber, PropStrOrArr, PropString, Status, themeProps } from 'common';
import { baseInputProps } from '../input/type';

export const mentionsProps = {
  ...baseInputProps,
  ...themeProps,
  triggers: PropStrOrArr(),
  label: PropString(),
  labelType: PropString<'float'>(),
  showLengthInfo: PropBoolean(),
  showClearIcon: PropBoolean(),
  status: PropString<Status>(),

  /** rows of mentions. When autoRows is enabled, it's min rows */
  rows: PropNumber(),
  cols: PropNumber(),
  resize: PropString<'none' | 'both' | 'horizontal' | 'vertical'>(),
  autoRows: PropBoolean(),
  /** max rows of mentions, must be used with autoRows */
  maxRows: PropNumber(),
};

export const mentionsEmits = {
  update: null,
  enterDown: null,
};

// 如果选中的文本中包含 mention再点删除，即使只包含部分文本也会整个删除（如果prefix是空格呢，选中了空格也删除吗），或者如果出现选中，则改变这个选中
export type MentionBlock = {
  trigger: string;
  label: string;
  value: string;
  actualLength: number;
  append?: string;
  prepend?: string;
};

export type MentionsSetupProps = ExtractPropTypes<typeof mentionsProps>;
export type MentionsEvents = GetEventPropsFromEmits<typeof mentionsEmits>;
export type MentionsProps = Partial<MentionsSetupProps> & MentionsEvents;
