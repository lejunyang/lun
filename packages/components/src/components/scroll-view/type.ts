import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  PropString,
  CommonProps,
  PropBoolean,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const scrollViewProps = freeze({
  observeResize: PropBoolean(),
  scrollProgressVar: PropString(),
  intersectionAttr: PropString(),
});

export const scrollViewEmits = freeze({
});

export type ScrollViewSetupProps = ExtractPropTypes<typeof scrollViewProps> & CommonProps;
export type ScrollViewEvents = GetEventPropsFromEmits<typeof scrollViewEmits>;
export type ScrollViewProps = Partial<ScrollViewSetupProps> & ScrollViewEvents;
