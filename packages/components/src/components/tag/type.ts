import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  PropString,
  themeProps,
  createTransitionProps,
  CommonProps,
  PropObjOrBool,
  createEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const tagProps = freeze({
  ...themeProps,
  ...createTransitionProps('remove'),
  label: PropString(),
  removable: PropObjOrBool(),
  tabindex: PropString(), // temp fix because of vue bug
});

export const tagEmits = createEmits<{
  remove: undefined;
  afterRemove: undefined;
}>(['remove', 'afterRemove']);

export type TagSetupProps = ExtractPropTypes<typeof tagProps> & CommonProps;
export type TagEvents = GetEventPropsFromEmits<typeof tagEmits>;
export type TagProps = Partial<TagSetupProps> & TagEvents;
