import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  themeProps,
  CommonProps,
  PropString,
  PropBoolOrStr,
  PropResponsive,
  PropNumber,
  PropBoolean,
  GetEventMapFromEmits,
} from 'common';
import { AnchorHTMLAttributes, ExtractPropTypes } from 'vue';

export const textProps = freeze({
  ...themeProps,
  size: PropResponsive<'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'>(),
  text: PropString(),
  as: PropString<'code' | 'link' | 'blockquote' | 'kbd'>(),
  truncate: PropString(),
  ellipsisOffset: PropNumber(),
  ellipsis: PropBoolOrStr<'start' | 'end' | 'center' | boolean>(),
  // nice to have
  maxLines: PropNumber(),
  /** for as='link' */
  disabled: PropBoolean(),
});

export const textEmits = freeze({});

export type TextSetupProps = ExtractPropTypes<typeof textProps> & CommonProps;
export type TextEventProps = GetEventPropsFromEmits<typeof textEmits>;
export type TextEventMap = GetEventMapFromEmits<typeof textEmits>;
export type TextProps = Partial<TextSetupProps> & TextEventProps & AnchorHTMLAttributes;
