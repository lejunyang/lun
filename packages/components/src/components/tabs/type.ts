import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  themeProps,
  createTransitionProps,
  CommonProps,
  PropArray,
} from 'common';
import { ExtractPropTypes } from 'vue';

export type TabItem = {
  key?: string;
  label: string;
  closable?: boolean;
  content: any;
  forceRender?: boolean;
  destroyInactive?: boolean;
};

export const tabsProps = freeze({
  ...themeProps,
  ...createTransitionProps('panel'),
  items: PropArray<TabItem[]>(),
  closable: PropBoolean(),
  forceRender: PropBoolean(),
  destroyInactive: PropBoolean(),
});

export const tabsEmits = freeze({
  remove: null,
  afterRemove: null,
});

export type TabsSetupProps = ExtractPropTypes<typeof tabsProps> & CommonProps;
export type TabsEvents = GetEventPropsFromEmits<typeof tabsEmits>;
export type TabsProps = Partial<TabsSetupProps> & TabsEvents;
