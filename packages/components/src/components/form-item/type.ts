import { PropType, ExtractPropTypes } from 'vue';
import { editStateProps } from 'common';

export const formItemProps = {
  ...editStateProps,
  name: { type: String },
  plainName: { type: Boolean, default: undefined },
  array: { type: Boolean },
  label: { type: String },
  required: { type: String },
  markPosition: { type: String as PropType<'start' | 'end' | 'none'> },
};

export type FormItemProps = ExtractPropTypes<typeof formItemProps>;