import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  themeProps,
  CommonProps,
  createEmits,
  GetEventMapFromEmits,
  editStateProps,
  PropNumber,
  PropBoolean,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const paginationProps = freeze({
  ...themeProps,
  ...editStateProps,
  current: PropNumber(),
  /** total number of pages */
  pages: PropNumber(),
  pageSize: PropNumber(),
  /** total number of data items, should be used with `pageSize` to calculate pages. If `total` and `pageSize` are valid, they take precedence over `pages` */
  total: PropNumber(),
  /**
   * @default 1
   * determine the number of buttons to display on each side between the current page button and dotsQuickJump button
   */
  siblings: PropNumber(),
  /**
   * @default 1
   * determine the number of buttons to display on the left/right boundary before/after the dotsQuickJump button
   */
  boundaries: PropNumber(),
  noControls: PropBoolean(),
  /**
   * @default 5
   */
  dotsJump: PropNumber(),
});

export const paginationEmits = createEmits<{
  update: number;
}>(['update']);

export type PaginationSetupProps = ExtractPropTypes<typeof paginationProps> & CommonProps;
export type PaginationEventProps = GetEventPropsFromEmits<typeof paginationEmits>;
export type PaginationEventMap = GetEventMapFromEmits<typeof paginationEmits>;
export type PaginationProps = Partial<PaginationSetupProps> & PaginationEventProps;
