import { freeze } from '@lun-web/utils';
import { PropBoolean, PropString, PropObjOrStr, CommonProps, GetEventPropsFromEmits, GetEventMapFromEmits } from 'common';
import { ExtractPropTypes, CSSProperties } from 'vue';

export const dividerProps = freeze({
  /**
   * @locale.zh-CN 是否使用虚线样式
   * @locale.en Whether to render the divider as a dashed line
   */
  dashed: PropBoolean(),
  /**
   * @locale.zh-CN 文字相对于分割线的位置
   * @locale.en Position of the text relative to the divider
   * @default 'center'
   */
  textPosition: PropString<'start' | 'end' | 'center'>(),
  /**
   * @locale.zh-CN 文字距离起始位置的缩进距离，数字会被转换为像素值
   * @locale.en Indentation distance of the text from the starting edge; numbers are converted to pixels
   */
  textIndent: PropString(),
  /**
   * @locale.zh-CN 文字的样式，可设置的值等同于 vue 组件可设置的 style
   * @locale.en Style applied to the text, accepting the same values as a Vue component's style attribute
   */
  textStyle: PropObjOrStr<string | CSSProperties | CSSProperties[]>(),
  /**
   * @locale.zh-CN 分割线的方向，垂直方向没有默认插槽
   * @locale.en Direction of the divider; the vertical type does not have a default slot
   * @default 'horizontal'
   */
  type: PropString<'horizontal' | 'vertical'>(),
});

export const dividerEmits = freeze({});

export type DividerSetupProps = ExtractPropTypes<typeof dividerProps> & CommonProps;
export type DividerEventProps = GetEventPropsFromEmits<typeof dividerEmits>;
export type DividerEventMap = GetEventMapFromEmits<typeof dividerEmits>;
export type DividerProps = Partial<DividerSetupProps> & DividerEventProps;
