import { ExtractPropTypes } from 'vue';
import { editStateProps } from 'common';

export const formProps = {
  ...editStateProps,
  formData: { type: Object },
  plainName: { type: Boolean, default: undefined },
};

export type FormProps = ExtractPropTypes<typeof formProps>;
