import { freeze } from '@lun-web/utils';
import {
  CloseEmits,
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  Prop,
  PropFunction,
  PropObjOrBool,
  PropObject,
  PropString,
  Status,
  closeEmits,
  createEmits,
  createTransitionProps,
  themeProps,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { GetCustomRendererSource } from '../custom-renderer';

export const calloutProps = freeze({
  ...themeProps,
  ...createTransitionProps('close'),
  /**
   * @locale.zh-CN 提示框的主标题内容，支持自定义渲染源；若传入 Error 对象则自动展示为错误状态。
   * @locale.en The main message content of the callout, supports custom renderer sources; passing an Error switches it to the error status automatically.
   */
  message: Prop<GetCustomRendererSource>(),
  /**
   * @locale.zh-CN 提示框的描述内容，显示在 message 下方，支持自定义渲染源。
   * @locale.en The description content shown below the message, supports custom renderer sources.
   */
  description: Prop<GetCustomRendererSource>(),
  /**
   * @locale.zh-CN 自定义图标名称，未指定时会根据 status 自动选择对应状态图标。
   * @locale.en Custom icon name; when omitted, the icon is derived from the current status.
   */
  iconName: PropString(),
  /**
   * @locale.zh-CN 自定义图标所在的图标库名称。
   * @locale.en Name of the icon library that the custom icon belongs to.
   */
  iconLibrary: PropString(),
  /**
   * @locale.zh-CN 传递给图标组件的额外属性。
   * @locale.en Extra props forwarded to the icon component.
   */
  iconProps: PropObject(),
  /**
   * @locale.zh-CN 是否显示关闭图标；传入对象时会作为关闭图标的属性。
   * @locale.en Whether to show the close icon; an object value is spread as props for the close icon.
   */
  closable: PropObjOrBool(),
  /**
   * @locale.zh-CN 关闭前的回调，返回 false 可阻止关闭。
   * @locale.en Callback invoked before closing; returning false cancels the close.
   */
  beforeClose: PropFunction<() => boolean | void>(),
  /**
   * @locale.zh-CN 提示框状态，影响默认图标与样式，例如 success、warning、error、info 等。
   * @locale.en Status of the callout that affects the default icon and styling, e.g. success, warning, error, info.
   */
  status: PropString<Status>(),
  // TODO add messageStyle descriptionStyle
});

export const calloutEmits = createEmits<CloseEmits>(closeEmits);

export type CalloutSetupProps = ExtractPropTypes<typeof calloutProps> & CommonProps;
export type CalloutEventProps = GetEventPropsFromEmits<typeof calloutEmits>;
export type CalloutEventMap = GetEventMapFromEmits<typeof calloutEmits>;
export type CalloutProps = Partial<CalloutSetupProps> & CalloutEventProps;
