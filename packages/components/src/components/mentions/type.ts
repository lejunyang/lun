import { ExtractPropTypes } from 'vue';
import { GetEventPropsFromEmits, PropBoolean, PropNumber, PropStrOrArr, PropString, Status, themeProps } from 'common';
import { baseInputProps } from '../input/type';
import { MentionsTriggerParam } from '@lun/core';

export const mentionsProps = {
  ...baseInputProps,
  ...themeProps,
  triggers: PropStrOrArr(),
  suffix: PropString(),
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
  trigger: (_param: MentionsTriggerParam) => null,
  enterDown: null,
};



export type MentionsSetupProps = ExtractPropTypes<typeof mentionsProps>;
export type MentionsEvents = GetEventPropsFromEmits<typeof mentionsEmits>;
export type MentionsProps = Partial<MentionsSetupProps> & MentionsEvents;
