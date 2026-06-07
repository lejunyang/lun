import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  CommonProps,
  PropObject,
  PropString,
  editStateProps,
  themeProps,
  PropBoolean,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const colorPickerProps = freeze({
  ...editStateProps,
  ...themeProps,
  /**
   * @locale.zh-CN 当前选中的颜色值，格式为 HSL 字符串
   * @locale.en The currently selected color value, as an HSL string
   */
  value: PropString(),
  /**
   * @locale.zh-CN 初始颜色值，使用 [hue, saturation, lightness, alpha] 数组表示
   * @locale.en Initial color value, expressed as an [hue, saturation, lightness, alpha] array
   */
  defaultValue: PropObject<number[]>(),
  /**
   * @locale.zh-CN 仅显示颜色选择面板，不使用 Popover 包裹
   * @locale.en Only render the color panel without wrapping it in a Popover
   */
  panelOnly: PropBoolean(),
  /**
   * @locale.zh-CN 传递给内部 Popover 的属性
   * @locale.en Props forwarded to the underlying Popover
   */
  popoverProps: PropObject(),
  /**
   * @locale.zh-CN 是否隐藏透明度调节滑块
   * @locale.en Whether to hide the alpha (transparency) slider
   */
  noAlpha: PropBoolean(),
});

export const colorPickerEmits = createEmits<{
  update: string;
}>(['update']);

export type ColorPickerSetupProps = ExtractPropTypes<typeof colorPickerProps> & CommonProps;
export type ColorPickerEventProps = GetEventPropsFromEmits<typeof colorPickerEmits>;
export type ColorPickerEventMap = GetEventMapFromEmits<typeof colorPickerEmits>;
export type ColorPickerProps = Partial<ColorPickerSetupProps> & ColorPickerEventProps;
