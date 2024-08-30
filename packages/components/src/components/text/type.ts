import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  themeProps,
  CommonProps,
  PropString,
  PropBoolOrStr,
  PropResponsive,
  PropNumber,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const textProps = freeze({
  ...themeProps,
  size: PropResponsive<'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'>(),
  text: PropString(),
  as: PropString<'code' | 'link'>(),
  truncate: PropString(),
  ellipsisOffset: PropNumber(),
  ellipsis: PropBoolOrStr<'left' | 'middle' | 'right' | 'start' | 'end' | boolean>(),
  // nice to have
  maxLines: PropNumber(),
});

export const textEmits = freeze({});

export type TextSetupProps = ExtractPropTypes<typeof textProps> & CommonProps;
export type TextEvents = GetEventPropsFromEmits<typeof textEmits>;
export type TextProps = Partial<TextSetupProps> & TextEvents;
