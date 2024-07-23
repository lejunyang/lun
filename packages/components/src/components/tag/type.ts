import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropObject,
  PropString,
  themeProps,
  createTransitionProps,
  CommonProps,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const tagProps = freeze({
  ...themeProps,
  ...createTransitionProps('remove'),
  label: PropString(),
  removable: PropBoolean(),
  removeIconProps: PropObject(),
});

export const tagEmits = freeze({
  remove: null,
  afterRemove: null,
});

export type TagSetupProps = ExtractPropTypes<typeof tagProps> & CommonProps;
export type TagEvents = GetEventPropsFromEmits<typeof tagEmits>;
export type TagProps = Partial<TagSetupProps> & TagEvents;
