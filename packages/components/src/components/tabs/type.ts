import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  themeProps,
  createTransitionProps,
  CommonProps,
  PropArray,
  PropString,
} from 'common';
import { ExtractPropTypes } from 'vue';

export type TabItemObject = {
  slot?: string;
  label: string;
  closable?: boolean;
  panel?: any;
  forceRender?: boolean;
  destroyInactive?: boolean;
  disabled?: boolean;
};

export const tabsProps = freeze({
  ...themeProps,
  ...createTransitionProps('panel'),
  type: PropString<'horizontal' | 'vertical'>(),
  activeSlot: PropString(Number),
  defaultActiveSlot: PropString(Number),
  items: PropArray<TabItemObject[]>(),
  closable: PropBoolean(),
  /** common forceRender for items */
  forceRender: PropBoolean(),
  /** common destroyInactive for items */
  destroyInactive: PropBoolean(),
  noPanel: PropBoolean(),
});

export const tabsEmits = freeze({
  update: (_: string | number) => null,
  remove: null,
  afterRemove: null,
});

export type TabsSetupProps = ExtractPropTypes<typeof tabsProps> & CommonProps;
export type TabsEvents = GetEventPropsFromEmits<typeof tabsEmits>;
export type TabsProps = Partial<TabsSetupProps> & TabsEvents;

export const tabItemProps = freeze({
  slot: PropString(),
  label: PropString(),
  disabled: PropBoolean(),
  ...createTransitionProps('panel'),
});

export const tabItemEmits = freeze({});

export type TabItemSetupProps = ExtractPropTypes<typeof tabItemProps> & CommonProps;
export type TabItemEvents = GetEventPropsFromEmits<typeof tabItemEmits>;
export type TabItemProps = Partial<TabItemSetupProps> & TabItemEvents;
