import { Responsive } from '@lun/core';
import { ExtractPropTypes, PropType } from 'vue';

export const themeProps = {
  size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>> },
  color: { type: String },
  variant: { type: String as PropType<'solid' | 'soft' | 'surface' | 'outline' | string> },
  radius: { type: String as PropType<'none' | 'small' | 'medium' | 'large' | 'full'> },
  highContrast: { type: Boolean, default: undefined },
};

export type ThemeProps = ExtractPropTypes<typeof themeProps>;