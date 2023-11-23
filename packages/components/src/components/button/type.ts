import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps, themeProps } from 'common';

export const buttonProps = {
  ...editStateProps,
  ...themeProps,
  label: { type: String },
  asyncHandler: { type: Function as PropType<(e?: MouseEvent) => void> },
  spinProps: { type: Object },
  showLoading: { type: Boolean },
  iconPosition: { type: String as PropType<LogicalPosition> },
  debounce: { type: Number },
  throttle: { type: Number },
  holdOn: { type: Number },
};

export type ButtonProps = ExtractPropTypes<typeof buttonProps>;
