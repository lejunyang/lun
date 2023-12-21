import { GetEventPropsFromEmits, themeProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const tagProps = {
  ...themeProps,
  removable: { type: Boolean },
  removeIconProps: { type: Object },
};

export const tagEmits = {
  remove: null,
  afterRemove: null,
}

export type TagSetupProps = ExtractPropTypes<typeof tagProps>;
export type TagEvents = GetEventPropsFromEmits<typeof tagEmits>;
export type TagProps = Partial<TagSetupProps> & TagEvents;