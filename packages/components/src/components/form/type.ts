import { ExtractPropTypes } from 'vue';

export const formProps = {
  formData: { type: Object },
};

export type FormProps = ExtractPropTypes<typeof formProps>;
