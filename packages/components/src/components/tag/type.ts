import { themeProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const tagProps = {
  ...themeProps,
  closable: { type: Boolean },
  closeIconProps: { type: Object },
};

export type TagProps = ExtractPropTypes<typeof tagProps>;

declare module 'vue' {
  export interface IntrinsicElementAttributes {
    'l-tag': TagProps & HTMLAttributes;
  }
}
