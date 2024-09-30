import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, PropString, CommonProps, PropBoolean, PropNumOrArr } from 'common';
import { ExtractPropTypes } from 'vue';

export const scrollViewProps = freeze({
  observeResize: PropBoolean(),
  scrollXPercentVarName: PropString(),
  scrollYPercentVarName: PropString(),
  intersectionAttr: PropString(),
  xThresholds: PropNumOrArr(),
  yThresholds: PropNumOrArr(),
  hideScrollBar: PropBoolean(),
});

export const scrollViewEmits = freeze({});

export type ScrollViewSetupProps = ExtractPropTypes<typeof scrollViewProps> & CommonProps;
export type ScrollViewEvents = GetEventPropsFromEmits<typeof scrollViewEmits>;
export type ScrollViewProps = Partial<ScrollViewSetupProps> & ScrollViewEvents;
