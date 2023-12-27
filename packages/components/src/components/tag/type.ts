import { GetEventPropsFromEmits, PropBoolean, PropObject, PropString, themeProps, createTransitionProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const tagProps = {
  ...themeProps,
  ...createTransitionProps(),
  label: PropString(),
  removable: PropBoolean(),
  removeIconProps: PropObject(),
};

export const tagEmits = {
  remove: null,
  afterRemove: null,
};

export type TagSetupProps = ExtractPropTypes<typeof tagProps>;
export type TagEvents = GetEventPropsFromEmits<typeof tagEmits>;
export type TagProps = Partial<TagSetupProps> & TagEvents;
