import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropObjOrStr,
  PropString,
  themeProps,
} from 'common';
import { CSSProperties, ExtractPropTypes } from 'vue';

export const spinProps = freeze({
  ...themeProps,
  /**
   * @locale.zh-CN 加载图标的类型
   * @locale.en Type of the loading indicator
   * @default 'circle'
   */
  type: PropString<'circle'>(),
  /**
   * @locale.zh-CN 自定义 SVG 图标的样式，可用于覆盖 font-size 和 color 来控制图标大小与颜色，优先级高于主题
   * @locale.en Custom style for the SVG indicator, e.g. font-size and color to override theme size and color
   */
  svgStyle: PropObjOrStr<CSSProperties | string>(),
  /**
   * @locale.zh-CN 圆圈类型图标的描边宽度
   * @locale.en Stroke width of the circle indicator
   * @default 4
   */
  strokeWidth: PropNumber(),
  /**
   * @locale.zh-CN 是否处于加载中状态
   * @locale.en Whether the spin is in the loading state
   * @default true
   */
  spinning: PropBoolean(),
  /**
   * @locale.zh-CN 延迟展示加载效果的毫秒数，用于避免短时间加载造成的闪烁
   * @locale.en Delay in milliseconds before showing the indicator, used to avoid flicker on quick loads
   */
  delay: PropNumber(),
  /**
   * @locale.zh-CN 是否作为容器使用，开启后可包裹子节点并将图标显示在容器中央
   * @locale.en Whether to use as a container that wraps children and centers the indicator
   */
  asContainer: PropBoolean(),
  /**
   * @locale.zh-CN 作为容器时显示的提示文本，也可通过 tip 插槽自定义
   * @locale.en Tip text displayed when used as a container, can also be customized via the tip slot
   */
  tip: PropString(),
});

export const spinEmits = freeze({});

export type SpinSetupProps = ExtractPropTypes<typeof spinProps> & CommonProps;
export type SpinEventProps = GetEventPropsFromEmits<typeof spinEmits>;
export type SpinEventMap = GetEventMapFromEmits<typeof spinEmits>;
export type SpinProps = Partial<SpinSetupProps> & SpinEventProps;
