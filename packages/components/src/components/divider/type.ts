import { PropBoolean, PropString, PropObjOrStr } from 'common';
import { ExtractPropTypes, CSSProperties } from 'vue';

export const dividerProps = {
  dashed: PropBoolean(),
  textPosition: PropString<'start' | 'end' | 'center'>(),
  textIndent: PropString(),
  textStyle: PropObjOrStr<string | CSSProperties | CSSProperties[]>(),
  type: PropString<'horizontal' | 'vertical'>(),
};

export type DividerSetupProps = ExtractPropTypes<typeof dividerProps>;
export type DividerProps = Partial<DividerSetupProps>;
