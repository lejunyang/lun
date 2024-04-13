import { freeze } from '@lun/utils';
import { PropBoolean, PropString, PropObjOrStr, CommonProps, GetEventPropsFromEmits } from 'common';
import { ExtractPropTypes, CSSProperties } from 'vue';

export const dividerProps = freeze({
  dashed: PropBoolean(),
  textPosition: PropString<'start' | 'end' | 'center'>(),
  textIndent: PropString(),
  textStyle: PropObjOrStr<string | CSSProperties | CSSProperties[]>(),
  type: PropString<'horizontal' | 'vertical'>(),
});

export const dividerEmits = freeze({});

export type DividerSetupProps = ExtractPropTypes<typeof dividerProps> & CommonProps;
export type DividerEvents = GetEventPropsFromEmits<typeof dividerEmits>;
export type DividerProps = Partial<DividerSetupProps>;
