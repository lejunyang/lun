import { ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  Prop,
  PropBoolean,
  PropNumber,
  PropStrOrArr,
  PropString,
  Status,
  createEmits,
  themeProps,
} from 'common';
import { baseInputProps } from '../input/type';
import { MentionSpan, MentionsTriggerParam } from '@lun-web/core';
import { createOptionProps } from 'hooks';
import { freeze } from '@lun-web/utils';
import { GetCustomRendererSource } from '../custom-renderer';

export const mentionsProps = freeze({
  ...baseInputProps,
  ...themeProps,
  ...createOptionProps(false, true),
  /**
   * @locale.zh-CN 是否禁用候选项弹窗，启用后输入 trigger 不会弹出选项，用户自由输入，遇到 suffix 或回车后转为高亮块
   * @locale.en Whether to disable the options popup. When enabled, typing a trigger does not open the picker; the user types freely and the input becomes a highlighted span once the suffix or Enter is hit
   */
  noOptions: PropBoolean(),
  /**
   * @locale.zh-CN 触发候选弹窗的字符，可设置多个，会被直接用于构造正则表达式
   * @locale.en Characters that trigger the options popup. Multiple values are allowed and are used directly to build a regex
   * @default ['@']
   */
  triggers: PropStrOrArr(),
  /**
   * @locale.zh-CN 高亮块的结束字符，会被直接用于构造正则表达式
   * @locale.en Terminator character of a mention span; used directly when building the regex
   * @default ' '
   */
  suffix: PropString(),
  /**
   * @locale.zh-CN 触发内容高亮使用的 CSS Highlight 名称，浏览器支持 CSS Highlight API 时会启用 trigger 后内容高亮
   * @locale.en CSS Highlight name used to highlight the in-progress trigger text. Active only when the browser supports the CSS Custom Highlight API
   */
  triggerHighlight: PropString(),
  /**
   * @locale.zh-CN 输入框的标签文本
   * @locale.en Label text for the input
   */
  label: PropString(),
  /**
   * @locale.zh-CN 标签展示形式，设为 float 时为浮动标签
   * @locale.en Label display style; use float for a floating label
   */
  labelType: PropString<'float'>(),
  /**
   * @locale.zh-CN 是否显示字符长度信息
   * @locale.en Whether to show the character length info
   */
  showLengthInfo: PropBoolean(),
  /**
   * @locale.zh-CN 是否显示清除按钮
   * @locale.en Whether to show the clear icon
   */
  showClearIcon: PropBoolean(),
  /**
   * @locale.zh-CN 输入状态，用于呈现校验或提示样式
   * @locale.en Input status used for validation or hint styling
   */
  status: PropString<Status>(),

  /**
   * @locale.zh-CN 文本域的行数，启用 autoRows 时表示最小行数
   * @locale.en Rows of the textarea. When autoRows is enabled, it represents the minimum rows
   */
  rows: PropNumber(),
  /**
   * @locale.zh-CN 文本域的列数
   * @locale.en Columns of the textarea
   */
  cols: PropNumber(),
  /**
   * @locale.zh-CN 文本域是否可缩放及缩放方向
   * @locale.en Whether the textarea is resizable and in which directions
   */
  resize: PropString<'none' | 'both' | 'horizontal' | 'vertical'>(),
  /**
   * @locale.zh-CN 自定义高亮块的渲染，返回值由 custom-renderer 进行渲染
   * @locale.en Custom renderer for a mention span; the return value is handled by custom-renderer
   */
  mentionRenderer: Prop<GetCustomRendererSource<[item: MentionSpan, necessaryProps: Record<string, any>], true>>(),
});

export const mentionsEmits = createEmits<{
  update: string | null;
  updateRaw: readonly (string | MentionSpan)[];
  trigger: MentionsTriggerParam;
  enterDown: KeyboardEvent;
}>(['update', 'updateRaw', 'trigger', 'enterDown']);

export type MentionsSetupProps = ExtractPropTypes<typeof mentionsProps> & CommonProps;
export type MentionsEventProps = GetEventPropsFromEmits<typeof mentionsEmits>;
export type MentionsEventMap = GetEventMapFromEmits<typeof mentionsEmits>;
export type MentionsProps = Partial<MentionsSetupProps> & MentionsEventProps;
