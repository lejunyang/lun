import { themeProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const tagProps = {
  ...themeProps,
  
  removable: { type: Boolean },
  removeIconProps: { type: Object },
};

export type TagProps = ExtractPropTypes<typeof tagProps>;