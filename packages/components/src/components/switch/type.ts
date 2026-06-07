import { MaybePromise } from '@lun-web/core';
import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropFunction,
  PropObject,
  PropString,
  createEmits,
  editStateProps,
  themeProps,
  valueProp,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const switchProps = freeze({
  ...editStateProps,
  ...themeProps,
  /**
   * @locale.zh-CN 开关是否处于选中状态
   * @locale.en Whether the switch is checked.
   */
  checked: PropBoolean(),
  /**
   * @locale.zh-CN 开关处于选中状态时对应的值
   * @locale.en The value bound when the switch is checked.
   * @default true
   */
  trueValue: valueProp,
  /**
   * @locale.zh-CN 开关处于未选中状态时对应的值
   * @locale.en The value bound when the switch is unchecked.
   * @default false
   */
  falseValue: valueProp,
  /**
   * @locale.zh-CN 选中状态下显示的文字
   * @locale.en Text displayed when the switch is checked.
   */
  trueText: PropString(),
  /**
   * @locale.zh-CN 未选中状态下显示的文字
   * @locale.en Text displayed when the switch is unchecked.
   */
  falseText: PropString(),
  /**
   * @locale.zh-CN 加载状态时传递给内部 spin 组件的属性
   * @locale.en Props forwarded to the inner spin component when loading.
   */
  spinProps: PropObject(),
  /**
   * @locale.zh-CN 切换前的异步处理函数，返回 false、reject 或抛出异常将阻止本次更新
   * @locale.en Async handler invoked before toggling; returning false, rejecting, or throwing prevents the update.
   */
  beforeUpdate: PropFunction<(prevChecked: boolean) => MaybePromise<boolean | void>>(),
});

export const switchEmits = createEmits<{
  update: { value: unknown; checked: boolean };
}>(['update']);

export type SwitchSetupProps = ExtractPropTypes<typeof switchProps> & CommonProps;
export type SwitchEventProps = GetEventPropsFromEmits<typeof switchEmits>;
export type SwitchEventMap = GetEventMapFromEmits<typeof switchEmits>;
export type SwitchProps = Partial<SwitchSetupProps> & SwitchEventProps;
