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
  /**
   * @locale.zh-CN 标签显示的文本内容，也可通过默认插槽传入
   * @locale.en Text content shown inside the tag; can also be provided via the default slot
   */
  label: PropString(),
  /**
   * @locale.zh-CN 是否可删除，开启后会在标签右侧渲染一个关闭图标；传入对象可作为该图标的额外属性
   * @locale.en Whether the tag is removable; when enabled a close icon is rendered, and an object value is forwarded as props to that icon
   */
  removable: PropObjOrBool(),
  /**
   * @locale.zh-CN 标签根元素的 tabindex 属性
   * @locale.en The tabindex attribute applied to the tag's root element
   */
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
