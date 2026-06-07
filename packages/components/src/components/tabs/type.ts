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
  /**
   * @locale.zh-CN 标签组的排列方向
   * @locale.en Orientation of the tabs
   * @default 'horizontal'
   */
  type: PropString<'horizontal' | 'vertical'>(),
  /**
   * @locale.zh-CN 当前激活的标签项，对应子项的 slot 值或索引，受控属性
   * @locale.en The currently active tab, matching a child's slot value or index. Controlled prop
   */
  activeSlot: PropString(Number),
  /**
   * @locale.zh-CN 默认激活的标签项，对应子项的 slot 值或索引，非受控属性
   * @locale.en The default active tab, matching a child's slot value or index. Uncontrolled prop
   */
  defaultActiveSlot: PropString(Number),
  /**
   * @locale.zh-CN 通过数组方式声明标签项，优先级高于子元素 l-tab-item
   * @locale.en Declare tab items via an array. Takes priority over l-tab-item children
   */
  items: PropArray<TabItemObject[]>(),
  /**
   * @locale.zh-CN 标签项是否可关闭
   * @locale.en Whether tab items can be closed
   */
  closable: PropBoolean(),
  /**
   * @locale.zh-CN 是否在初始化时即渲染所有面板内容，作用于所有标签项
   * @locale.en Whether to render all panels on mount, applied to all items
   */
  forceRender: PropBoolean(),
  /**
   * @locale.zh-CN 是否在标签未激活时销毁其面板内容，作用于所有标签项
   * @locale.en Whether to destroy panel content when a tab becomes inactive, applied to all items
   */
  destroyInactive: PropBoolean(),
  /**
   * @locale.zh-CN 是否不渲染面板区域，仅显示导航栏
   * @locale.en Whether to hide the panel area and only render the tab nav
   */
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
  /**
   * @locale.zh-CN 标签项的唯一标识，与父组件的 activeSlot 匹配以决定激活状态
   * @locale.en Unique identifier for the tab item, matched against the parent's activeSlot to determine active state
   */
  slot: PropString(),
  /**
   * @locale.zh-CN 标签项在导航栏中显示的标题内容
   * @locale.en Title content displayed in the tab nav
   */
  label: Prop<GetCustomRendererSource>(),
  /**
   * @locale.zh-CN 是否禁用该标签项
   * @locale.en Whether the tab item is disabled
   */
  disabled: PropBoolean(),
  ...createTransitionProps('panel'),
});

export const tabItemEmits = freeze({});

export type TabItemSetupProps = ExtractPropTypes<typeof tabItemProps> & CommonProps;
export type TabItemEventProps = GetEventPropsFromEmits<typeof tabItemEmits>;
export type TabItemEventMap = GetEventMapFromEmits<typeof tabItemEmits>;
export type TabItemProps = Partial<TabItemSetupProps> & TabItemEventProps;
