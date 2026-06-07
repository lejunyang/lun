import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  createEmits,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropObject,
  PropString,
  Status,
  themeProps,
} from 'common';
import { CSSProperties, ExtractPropTypes } from 'vue';

export const progressProps = freeze({
  ...themeProps,
  /**
   * @locale.zh-CN 当前进度值，范围 0 到 100
   * @locale.en Current progress value, ranging from 0 to 100
   */
  value: PropNumber(),
  /**
   * @locale.zh-CN 进度条类型
   * @locale.en Progress bar type
   * @default 'wave'
   */
  type: PropString<'wave' | 'ring' | 'line' | 'steps' | 'page-top'>(),
  /**
   * @locale.zh-CN 是否隐藏百分比文字
   * @locale.en Whether to hide the percentage text
   */
  noPercent: PropBoolean(),
  /**
   * @locale.zh-CN 进度条状态
   * @locale.en Progress bar status
   */
  status: PropString<Status>(),
  /**
   * @locale.zh-CN 是否根据状态显示对应的状态图标
   * @locale.en Whether to show the status icon corresponding to the status
   */
  showStatusIcon: PropBoolean(),
  /**
   * @locale.zh-CN 进度条的填充颜色
   * @locale.en Fill color of the progress bar
   */
  strokeColor: PropString(),
  /**
   * @locale.zh-CN 进度条的轨道颜色
   * @locale.en Trail color of the progress bar
   */
  trailerColor: PropString(),
  /**
   * @locale.zh-CN 进度条宽度
   * @locale.en Width of the progress bar
   */
  width: PropNumber(),
  /**
   * @locale.zh-CN 进度条高度
   * @locale.en Height of the progress bar
   */
  height: PropNumber(),
  /**
   * @locale.zh-CN 进度条轨道的自定义样式
   * @locale.en Custom style for the progress bar trail
   */
  trailerStyle: PropObject<CSSProperties>(),
  /**
   * @locale.zh-CN 进度条填充部分的自定义样式
   * @locale.en Custom style for the filled portion of the progress bar
   */
  strokeStyle: PropObject<CSSProperties>(),
});

export const progressEmits = createEmits<{
  done: undefined;
}>(['done']);

export type ProgressSetupProps = ExtractPropTypes<typeof progressProps> & CommonProps;
export type ProgressEventProps = GetEventPropsFromEmits<typeof progressEmits>;
export type ProgressEventMap = GetEventMapFromEmits<typeof progressEmits>;
export type ProgressProps = Partial<ProgressSetupProps> & ProgressEventProps;
