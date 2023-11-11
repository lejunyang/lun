import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps } from 'common';
import { UseFormReturn } from "@lun/core";

export const formProps = {
  ...editStateProps,
  form: { type: Object as PropType<UseFormReturn>, },
  defaultFormData: { type: Object },
  defaultFormState: { type: Object },
  plainName: { type: Boolean },
  validateAbort: { type: String as PropType<'first' | 'item'> },
  scrollToFirstError: { type: Boolean },
};

export type FormProps = ExtractPropTypes<typeof formProps>;
