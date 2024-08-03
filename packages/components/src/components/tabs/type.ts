import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, PropBoolean, themeProps, createTransitionProps, CommonProps, PropArray, PropString } from 'common';
import { ExtractPropTypes } from 'vue';

export type TabItem = {
  slot?: string;
  label: string;
  closable?: boolean;
  content: any;
  forceRender?: boolean;
  destroyInactive?: boolean;
  disabled?: boolean;
};

export const tabsProps = freeze({
  ...themeProps,
  ...createTransitionProps('panel'),
  type: PropString<'horizontal' | 'vertical'>(),
  activeSlot: PropString(),
  defaultActiveSlot: PropString(),
  items: PropArray<TabItem[]>(),
  closable: PropBoolean(),
  forceRender: PropBoolean(),
  destroyInactive: PropBoolean(),
});

export const tabsEmits = freeze({
  update: (_: string) => null,
  remove: null,
  afterRemove: null,
});

export type TabsSetupProps = ExtractPropTypes<typeof tabsProps> & CommonProps;
export type TabsEvents = GetEventPropsFromEmits<typeof tabsEmits>;
export type TabsProps = Partial<TabsSetupProps> & TabsEvents;

export const tabItemProps = freeze({});

export const tabItemEmits = freeze({});

export type TabItemSetupProps = ExtractPropTypes<typeof tabItemProps> & CommonProps;
export type TabItemEvents = GetEventPropsFromEmits<typeof tabItemEmits>;
export type TabItemProps = Partial<TabItemSetupProps> & TabItemEvents;
