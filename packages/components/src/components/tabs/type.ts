import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  themeProps,
  createTransitionProps,
  CommonProps,
  PropArray,
  PropString,
  Prop,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { GetCustomRendererSource } from '../custom-renderer';

export type TabItemObject = {
  // TODO add icon
  slot?: string;
  label: GetCustomRendererSource;
  closable?: boolean;
  panel?: GetCustomRendererSource;
  forceRender?: boolean;
  destroyInactive?: boolean;
  disabled?: boolean;
};

// TODO auto Hide label. vertical: hover to expand, or collapse and only show icon; horizontal: only show label for active tab, others show icon only
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

export const tabsEmits = createEmits<{
  update: string | number;
  remove: undefined;
  afterRemove: undefined;
}>(['update', 'remove', 'afterRemove']);

export type TabsSetupProps = ExtractPropTypes<typeof tabsProps> & CommonProps;
export type TabsEventProps = GetEventPropsFromEmits<typeof tabsEmits>;
export type TabsEventMap = GetEventMapFromEmits<typeof tabsEmits>;
export type TabsProps = Partial<TabsSetupProps> & TabsEventProps;

export const tabItemProps = freeze({
  slot: PropString(),
  label: Prop<GetCustomRendererSource>(),
  disabled: PropBoolean(),
  ...createTransitionProps('panel'),
});

export const tabItemEmits = freeze({});

export type TabItemSetupProps = ExtractPropTypes<typeof tabItemProps> & CommonProps;
export type TabItemEventProps = GetEventPropsFromEmits<typeof tabItemEmits>;
export type TabItemEventMap = GetEventMapFromEmits<typeof tabItemEmits>;
export type TabItemProps = Partial<TabItemSetupProps> & TabItemEventProps;
