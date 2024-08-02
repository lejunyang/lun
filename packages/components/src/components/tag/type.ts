import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  PropString,
  themeProps,
  createTransitionProps,
  CommonProps,
  PropObjOrBool,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const tagProps = freeze({
  ...themeProps,
  ...createTransitionProps('remove'),
  label: PropString(),
  removable: PropObjOrBool(),
});

export const tagEmits = freeze({
  remove: null,
  afterRemove: null,
});

export type TagSetupProps = ExtractPropTypes<typeof tagProps> & CommonProps;
export type TagEvents = GetEventPropsFromEmits<typeof tagEmits>;
export type TagProps = Partial<TagSetupProps> & TagEvents;
