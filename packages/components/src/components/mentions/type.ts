import { ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventPropsFromEmits,
  Prop,
  PropBoolean,
  PropNumber,
  PropStrOrArr,
  PropString,
  Status,
  themeProps,
} from 'common';
import { baseInputProps } from '../input/type';
import { MentionSpan, MentionsTriggerParam } from '@lun/core';
import { createOptionProps } from 'hooks';
import { freeze } from '@lun/utils';
import { GetCustomRendererSource } from '../custom-renderer';

export const mentionsProps = freeze({
  ...baseInputProps,
  ...themeProps,
  ...createOptionProps(false, true),
  noOptions: PropBoolean(),
  triggers: PropStrOrArr(),
  suffix: PropString(),
  triggerHighlight: PropString(),
  label: PropString(),
  labelType: PropString<'float'>(),
  showLengthInfo: PropBoolean(),
  showClearIcon: PropBoolean(),
  status: PropString<Status>(),

  /** rows of mentions. When autoRows is enabled, it's min rows */
  rows: PropNumber(),
  cols: PropNumber(),
  resize: PropString<'none' | 'both' | 'horizontal' | 'vertical'>(),
  mentionRenderer: Prop<GetCustomRendererSource<[item: MentionSpan, necessaryProps: Record<string, any>], true>>(),
});

export const mentionsEmits = freeze({
  update: (_val: string | null) => null,
  updateRaw: (_raw: readonly (string | MentionSpan)[]) => null,
  trigger: (_param: MentionsTriggerParam) => null,
  enterDown: null,
});

export type MentionsSetupProps = ExtractPropTypes<typeof mentionsProps> & CommonProps;
export type MentionsEvents = GetEventPropsFromEmits<typeof mentionsEmits>;
export type MentionsProps = Partial<MentionsSetupProps> & MentionsEvents;
