import { PropType, ExtractPropTypes } from 'vue';

export const formItemProps = {
  name: { type: String },
  array: { type: Boolean },
  label: { type: String },
  required: { type: String },
  markPosition: { type: String as PropType<'start' | 'end' | 'none'> },
};

export type FormItemProps = ExtractPropTypes<typeof formItemProps>;