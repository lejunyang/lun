import { ExtractPropTypes, PropType } from 'vue';
import { ThemeVariants, editStateProps, themeProps, LogicalPosition, GetEventPropsFromEmits } from 'common';
import { Responsive } from '@lun/core';

export const buttonProps = {
  ...editStateProps,
  ...themeProps,
  size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3' | '4'>> },
  variant: { type: String as PropType<ThemeVariants | 'ghost'> },
  label: { type: String },
  asyncHandler: { type: Function as PropType<(e?: MouseEvent) => void> },
  spinProps: { type: Object },
  showLoading: { type: Boolean },
  iconPosition: { type: String as PropType<LogicalPosition> },
  debounce: { type: Number },
  throttle: { type: Number },
  holdOn: { type: Number },
};

export const buttonEmits = { validClick: null };

export type ButtonSetupProps = ExtractPropTypes<typeof buttonProps>;
export type ButtonEvents = GetEventPropsFromEmits<typeof buttonEmits>;
export type ButtonProps = Partial<ButtonSetupProps> & ButtonEvents;
