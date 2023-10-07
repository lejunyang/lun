import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps } from 'common';
import { Responsive } from '@lun/core';

export const buttonProps = {
  ...editStateProps,
  label: { type: String },
  asyncHandler: { type: Function as PropType<(e: MouseEvent) => void> },
  spinProps: { type: Object },
  size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>> },
  showLoading: { type: Boolean },
  iconPosition: { type: String as PropType<LogicalPosition> },
};

export type ButtonProps = ExtractPropTypes<typeof buttonProps>;
