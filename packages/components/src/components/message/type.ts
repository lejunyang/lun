import { Side } from '@floating-ui/vue';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  OpenCloseEmits,
  PropBoolean,
  PropNumber,
  PropObjOrStr,
  PropString,
  Status,
  createEmits,
  createTransitionProps,
  openCloseEmits,
} from 'common';
import { ExtractPropTypes, HTMLAttributes } from 'vue';
import { CalloutProps, calloutProps } from '../callout/type';
import { MaybeRefLikeOrGetter } from '@lun-web/core';
import { freeze } from '@lun-web/utils';

export const messageProps = freeze({
  ...calloutProps,
  ...createTransitionProps('close', 'callout'),
  /**
   * @locale.zh-CN 指定消息容器的实现方式：popover 使用原生 Popover API，normal 在当前位置使用 fixed 定位，teleport 将内容渲染到 teleport-holder 中。
   * @locale.en Determines the message container implementation: popover uses the native Popover API, normal renders in place with fixed positioning, and teleport renders content into a teleport-holder.
   */
  type: PropString<'popover' | 'normal' | 'teleport'>(),
  /**
   * @locale.zh-CN 当 type 为 teleport 时的目标容器，若为空则使用第一个 theme-provider。
   * @locale.en Target container used when type is 'teleport'; falls back to the first theme-provider when falsy.
   */
  to: PropObjOrStr<MaybeRefLikeOrGetter<string | HTMLElement>>(),
  /**
   * @locale.zh-CN 消息出现的位置。
   * @locale.en Placement where messages appear on screen.
   */
  placement: PropString<Side | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'center'>(),
  /**
   * @locale.zh-CN 相对于 placement 边缘的偏移量，placement 为 center 时不生效。
   * @locale.en Offset relative to the placement side; ignored when placement is 'center'.
   * @default 10
   */
  offset: PropNumber(),
  /**
   * @locale.zh-CN 消息自动关闭的时间，单位毫秒；为 'none' 或 null 时不会自动关闭，未指定时默认 3000。
   * @locale.en Auto-close duration in milliseconds; 'none' or null disables auto-close, defaults to 3000 when unspecified.
   */
  duration: PropNumber<number | 'none'>(),
  /**
   * @locale.zh-CN 鼠标移入消息时是否暂停自动关闭计时，移出后重新计时。
   * @locale.en Whether to pause the auto-close timer while the pointer hovers the message and restart it on leave.
   * @default true
   */
  resetDurationOnHover: PropBoolean(),
});

export const messageEmits = createEmits<
  OpenCloseEmits & {
    allClosed: undefined;
  }
>([...openCloseEmits, 'allClosed']);

export type MessageOpenConfig = {
  key?: string | number;
  type?: Status;
  duration?: number | string;
  resetDurationOnHover?: boolean;
} & CalloutProps &
  MessageEventProps &
  HTMLAttributes;

export type MessageSetupProps = ExtractPropTypes<typeof messageProps> & CommonProps;
export type MessageEventProps = GetEventPropsFromEmits<typeof messageEmits>;
export type MessageEventMap = GetEventMapFromEmits<typeof messageEmits>;
export type MessageProps = Partial<MessageSetupProps> & MessageEventProps;

export type MessageMethods = {
  open(config?: MessageOpenConfig): string;
  close(key: string | number): void;
  closeAll(): void;
};
