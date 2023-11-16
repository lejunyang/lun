import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps } from 'common';

export const uploadProps = {
  ...editStateProps,
  value: { type: [Object, Array] as PropType<{} | {}[]> },
  multiple: { type: Boolean },
};

export type UploadProps = ExtractPropTypes<typeof uploadProps>;

declare module 'vue' {
  export interface IntrinsicElementAttributes {
    'l-upload': UploadProps & HTMLAttributes;
  }
}
