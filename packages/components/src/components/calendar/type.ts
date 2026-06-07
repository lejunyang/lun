import { DatePanelType, DateValueType } from '@lun-web/core';
import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropObject,
  PropString,
  themeProps,
  CommonProps,
  PropArray,
  PropObjOrStr,
  editStateProps,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';

type DateRaw = DateValueType | DateValueType[] | DateValueType[][];
type DateStr = string | string[] | string[][];

export const calendarProps = freeze({
  ...themeProps,
  ...editStateProps,
  /**
   * @locale.zh-CN 日期面板类型，可选 date、week、month、quarter、year
   * @locale.en Date panel type, one of date, week, month, quarter, year
   * @default 'date'
   */
  type: PropString<DatePanelType>(),
  /**
   * @locale.zh-CN 当前选中的日期值，支持字符串或日期对象，开启 multiple 或 range 时为数组形式
   * @locale.en Currently selected date value, accepts string or date object; becomes an array when multiple or range is enabled
   */
  value: PropObjOrStr<DateStr | DateRaw>(),
  /**
   * @locale.zh-CN 当前面板展示的日期，用于控制面板显示的年份与月份
   * @locale.en The date currently shown in the panel, controlling which year and month is displayed
   */
  viewDate: PropObject<DateValueType>(),
  /**
   * @locale.zh-CN 是否启用日期范围选择
   * @locale.en Whether to enable date range selection
   */
  range: PropBoolean(),
  /**
   * @locale.zh-CN 是否启用多选；与 range 同时开启时可选择多个不重叠的日期范围
   * @locale.en Whether to enable multiple selection; combined with range it allows selecting multiple non-overlapping ranges
   */
  multiple: PropBoolean(),
  /**
   * @locale.zh-CN 日期值的格式化字符串
   * @locale.en Format string used for the date value
   */
  format: PropString(),
  /**
   * @locale.zh-CN 年份单元格的展示格式
   * @locale.en Display format for year cells
   */
  yearFormat: PropString(),
  /**
   * @locale.zh-CN 季度单元格的展示格式
   * @locale.en Display format for quarter cells
   */
  quarterFormat: PropString(),
  /**
   * @locale.zh-CN 月份单元格的展示格式
   * @locale.en Display format for month cells
   */
  monthFormat: PropString(),
  /**
   * @locale.zh-CN 是否在头部信息中将月份显示在年份之前
   * @locale.en Whether to render the month before the year in the header
   */
  monthBeforeYear: PropBoolean(),
  /**
   * @locale.zh-CN 周单元格的展示格式
   * @locale.en Display format for week cells
   */
  weekFormat: PropString(),
  /**
   * @locale.zh-CN 日期单元格的展示格式
   * @locale.en Display format for date cells
   */
  dateFormat: PropString(),
  /**
   * @locale.zh-CN 自定义月份的短名称数组，用于覆盖语言环境默认值
   * @locale.en Custom short month names array overriding the locale default
   */
  shortMonths: PropArray<string[]>(),
  /**
   * @locale.zh-CN 自定义星期的短名称数组，用于覆盖语言环境默认值
   * @locale.en Custom short weekday names array overriding the locale default
   */
  shortWeekDays: PropArray<string[]>(),
  /**
   * @locale.zh-CN 是否同时展示时间选择
   * @locale.en Whether to also show time selection
   */
  showTime: PropBoolean(),
  /**
   * @locale.zh-CN 时间选择是否使用 12 小时制
   * @locale.en Whether the time picker uses 12-hour format
   */
  use12Hours: PropBoolean(),
  /**
   * @locale.zh-CN 是否启用横向滚动切换月份，开启后通过 shift 加滚轮或触摸板横向滚动切换，触屏设备默认开启
   * @locale.en Whether to enable horizontal scrolling between months; on touch devices it is enabled by default
   */
  scrollable: PropBoolean(),
  /**
   * @locale.zh-CN 是否使用迷你模式渲染日历
   * @locale.en Whether to render the calendar in mini mode
   */
  mini: PropBoolean(),
  /**
   * @locale.zh-CN 当某一行的日期全部为上下月预览日期时，是否移除整行，例如 2024-07 的最后一行
   * @locale.en Whether to remove an entire row when all its dates are preview dates from the previous or next month
   */
  removePreviewRow: PropBoolean(),
  /**
   * @locale.zh-CN 是否隐藏面板中所有的预览日期
   * @locale.en Whether to hide all preview dates in the panel
   */
  hidePreviewDates: PropBoolean(),
});

export type CalendarUpdateDetail = { value: DateStr; raw: DateRaw };

export const calendarEmits = createEmits<{
  update: CalendarUpdateDetail;
  updateViewDate: DateValueType;
}>(['update', 'updateViewDate']);

export type CalendarSetupProps = ExtractPropTypes<typeof calendarProps> & CommonProps;
export type CalendarEventProps = GetEventPropsFromEmits<typeof calendarEmits>;
export type CalendarEventMap = GetEventMapFromEmits<typeof calendarEmits>;
export type CalendarProps = Partial<CalendarSetupProps> & CalendarEventProps;
