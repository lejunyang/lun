import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps } from 'common';

export const uploadProps = {
  ...editStateProps,
  value: { type: [Object, Array] as PropType<{} | {}[]> },
  multiple: { type: Boolean },
  accept: { type: String },
  strictAccept: { type: Boolean },
};

export type UploadSetupProps = ExtractPropTypes<typeof uploadProps>;
export type UploadProps = Partial<UploadSetupProps>;