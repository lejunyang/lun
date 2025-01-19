import { ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  Prop,
  PropBoolean,
  PropNumber,
  PropStrOrArr,
  PropString,
  Status,
  createEmits,
  themeProps,
} from 'common';
import { baseInputProps } from '../input/type';
import { MentionSpan, MentionsTriggerParam } from '@lun-web/core';
import { createOptionProps } from 'hooks';
import { freeze } from '@lun-web/utils';
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

export const mentionsEmits = createEmits<{
  update: string | null;
  updateRaw: readonly (string | MentionSpan)[];
  trigger: MentionsTriggerParam;
  enterDown: KeyboardEvent;
}>(['update', 'updateRaw', 'trigger', 'enterDown']);

export type MentionsSetupProps = ExtractPropTypes<typeof mentionsProps> & CommonProps;
export type MentionsEventProps = GetEventPropsFromEmits<typeof mentionsEmits>;
export type MentionsEventMap = GetEventMapFromEmits<typeof mentionsEmits>;
export type MentionsProps = Partial<MentionsSetupProps> & MentionsEventProps;
