import { ExtractPropTypes } from 'vue';
import {
  CommonProps,
  createEmits,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropString,
  Status,
  themeProps,
} from 'common';
import { baseInputProps } from '../input/type';
import { freeze } from '@lun-web/utils';

export const textareaProps = freeze({
  ...baseInputProps,
  ...themeProps,
  /**
   * @locale.zh-CN 文本域标签内容，可与浮动标签搭配使用。
   * @locale.en Label content for the textarea; pairs with the float label style.
   */
  label: PropString(),
  /**
   * @locale.zh-CN 标签展示类型，float 表示浮动标签。
   * @locale.en Label style; float renders a floating label.
   */
  labelType: PropString<'float'>(),
  /**
   * @locale.zh-CN 是否在文本域旁展示当前字数信息，配合 maxLength 时一并展示上限。
   * @locale.en Shows the current character count next to the textarea; displays the limit when maxLength is set.
   */
  showLengthInfo: PropBoolean(),
  /**
   * @locale.zh-CN 是否在有值且可编辑时展示一键清空图标。
   * @locale.en Shows a clear icon when the textarea has a value and is editable.
   */
  showClearIcon: PropBoolean(),
  /**
   * @locale.zh-CN 文本域状态，例如 success、warning、error，用于校验态样式。
   * @locale.en Textarea status such as success, warning, or error for validation styling.
   */
  status: PropString<Status>(),

  /**
   * @locale.zh-CN 文本域的行数；启用 autoRows 时表示最小行数。
   * @locale.en Number of rows for the textarea. When autoRows is enabled, this acts as the minimum rows.
   */
  rows: PropNumber(),
  /**
   * @locale.zh-CN 文本域的列数。
   * @locale.en Number of columns for the textarea.
   */
  cols: PropNumber(),
  /**
   * @locale.zh-CN 文本域的缩放方向，对应 CSS resize；autoRows 启用时会被强制为 none。
   * @locale.en Resize direction, mapped to the CSS resize property; forced to none when autoRows is enabled.
   */
  resize: PropString<'none' | 'both' | 'horizontal' | 'vertical'>(),
  /**
   * @locale.zh-CN 是否根据内容自动调整高度，开启后高度在 rows 与 maxRows 之间变化。
   * @locale.en Whether the textarea automatically grows with its content between rows and maxRows.
   */
  autoRows: PropBoolean(),
  /**
   * @locale.zh-CN 文本域的最大行数，需与 autoRows 一起使用。
   * @locale.en Maximum rows for the textarea; must be used together with autoRows.
   */
  maxRows: PropNumber(),
});

export const textareaEmits = createEmits<{
  update: string | null;
  enterDown: KeyboardEvent;
}>(['update', 'enterDown']);

export type TextareaSetupProps = ExtractPropTypes<typeof textareaProps> & CommonProps;
export type TextareaEventProps = GetEventPropsFromEmits<typeof textareaEmits>;
export type TextareaEventMap = GetEventMapFromEmits<typeof textareaEmits>;
export type TextareaProps = Partial<TextareaSetupProps> & TextareaEventProps;
