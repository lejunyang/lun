import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  PropString,
  themeProps,
  createTransitionProps,
  CommonProps,
  PropObjOrBool,
  createEmits,
  GetEventMapFromEmits,
  PropNumber,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const tagProps = freeze({
  ...themeProps,
  ...createTransitionProps('remove'),
  label: PropString(),
  removable: PropObjOrBool(),
  tabindex: PropNumber(), // temp fix because of vue bug
});

export const tagEmits = createEmits<{
  remove: undefined;
  afterRemove: undefined;
}>(['remove', 'afterRemove']);

export type TagSetupProps = ExtractPropTypes<typeof tagProps> & CommonProps;
export type TagEventProps = GetEventPropsFromEmits<typeof tagEmits>;
export type TagEventMap = GetEventMapFromEmits<typeof tagEmits>;
export type TagProps = Partial<TagSetupProps> & TagEventProps;
