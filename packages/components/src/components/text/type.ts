import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  themeProps,
  CommonProps,
  PropString,
  PropBoolOrStr,
  PropResponsive,
  PropNumber,
  PropBoolean,
  GetEventMapFromEmits,
} from 'common';
import { AnchorHTMLAttributes, ExtractPropTypes } from 'vue';

export const textProps = freeze({
  ...themeProps,
  /**
   * @locale.zh-CN 文本大小，支持 1 ～ 9 共 9 个等级，可为响应式值
   * @locale.en Text size, supports 9 levels from 1 to 9, can be a responsive value
   */
  size: PropResponsive<'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'>(),
  /**
   * @locale.zh-CN 文本内容，使用省略号偏移或居中省略时必须通过该属性设置
   * @locale.en Text content; required via this prop when using ellipsis offset or center ellipsis
   * @default ''
   */
  text: PropString(),
  /**
   * @locale.zh-CN 将文本渲染为指定元素类型，例如 link、code、blockquote、kbd
   * @locale.en Renders the text as the specified element type, such as link, code, blockquote, or kbd
   */
  as: PropString<'code' | 'link' | 'blockquote' | 'kbd'>(),
  /**
   * @locale.zh-CN 文本截断方式
   * @locale.en Text truncation mode
   */
  truncate: PropString(),
  /**
   * @locale.zh-CN 省略号偏移的字符数，从 ellipsis 指定的位置起算，不支持 ellipsis=center
   * @locale.en Number of characters to offset the ellipsis from the position specified by ellipsis; not supported when ellipsis=center
   */
  ellipsisOffset: PropNumber(),
  /**
   * @locale.zh-CN 启用单行省略并指定省略号位置，可选 start、end、center，其他值视为 end
   * @locale.en Enables single-line ellipsis and specifies its position; accepts start, end, center, other values are treated as end
   */
  ellipsis: PropBoolOrStr<'start' | 'end' | 'center' | boolean>(),
  // nice to have
  /**
   * @locale.zh-CN 多行文本最大显示行数，超出后省略
   * @locale.en Maximum number of lines for multi-line text before truncation
   */
  maxLines: PropNumber(),
  /**
   * @locale.zh-CN 仅当 as=link 时生效，禁用链接交互
   * @locale.en Only takes effect when as=link; disables link interaction
   */
  disabled: PropBoolean(),
});

export const textEmits = freeze({});

export type TextSetupProps = ExtractPropTypes<typeof textProps> & CommonProps;
export type TextEventProps = GetEventPropsFromEmits<typeof textEmits>;
export type TextEventMap = GetEventMapFromEmits<typeof textEmits>;
export type TextProps = Partial<TextSetupProps> & TextEventProps & AnchorHTMLAttributes;
