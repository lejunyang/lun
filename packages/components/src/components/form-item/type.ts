import { PropType, ExtractPropTypes } from 'vue';
import { editStateProps } from 'common';

export const formItemProps = {
  ...editStateProps,
  name: { type: String },
  plainName: { type: Boolean },
  array: { type: Boolean },
  label: { type: String },
  noLabel: { type: Boolean },
  required: { type: Boolean },
  markPosition: { type: String as PropType<'start' | 'end' | 'none'> },
  help: { type: String },
  message: { type: String },
  tooltip: { type: String },
};

export type FormItemProps = ExtractPropTypes<typeof formItemProps>;