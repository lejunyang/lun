import { ExtractPropTypes, PropType } from 'vue';
import { GetEventPropsFromEmits, editStateProps, themeProps, emitConstructor } from 'common';
import { UseFormReturn } from "@lun/core";

export const formProps = {
  ...editStateProps,
  ...themeProps,
  // no idea why prop `form` will be considered as a string attribute, use `formManager` instead
  formManager: { type: Object as PropType<UseFormReturn>, },
  defaultFormData: { type: Object },
  defaultFormState: { type: Object },
  plainName: { type: Boolean },
  validateAbort: { type: String as PropType<'first' | 'item'> },
  scrollToFirstError: { type: Boolean },

  layout: { type: String as PropType<'flex' | 'grid' | 'inline-flex' | 'inline-grid'> },
  labelWidth: { type: String },
  cols: { type: String },
};

export const formEmits = {
  update: emitConstructor<{ formData: Record<string, any>, path: string[] | string, value: any }>(),
}

export type FormSetupProps = ExtractPropTypes<typeof formProps>;
export type FormEvents = GetEventPropsFromEmits<typeof formEmits>;
export type FormProps = Partial<FormSetupProps> & FormEvents;
