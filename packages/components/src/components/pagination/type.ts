import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  themeProps,
  CommonProps,
  createEmits,
  GetEventMapFromEmits,
  editStateProps,
  PropNumber,
  PropArray,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const paginationProps = freeze({
  ...themeProps,
  ...editStateProps,
  current: PropNumber(),
  /** total number of pages */
  pages: PropNumber(),
  pageSize: PropNumber(),
  pageSizeOptions: PropArray<number[]>(),
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
  /** 
   * determine the content and the order to render, can be an array of the following values:\
   * `prev`: button to go to the previous page\
   * `pages`: buttons of all the pages\
   * `next`: button to go to the next page\
   * `sizes`: dropdown to select the page size\
   * @default ['prev', 'pages', 'next']
   */
  controls: PropArray<('prev' | 'pages' | 'next' | 'sizes')[]>(),
  /**
   * @default 5
   */
  dotsJump: PropNumber(),
});

export const paginationEmits = createEmits<{
  update: number;
  pageSizeUpdate: number;
}>(['update', 'pageSizeUpdate']);

export type PaginationSetupProps = ExtractPropTypes<typeof paginationProps> & CommonProps;
export type PaginationEventProps = GetEventPropsFromEmits<typeof paginationEmits>;
export type PaginationEventMap = GetEventMapFromEmits<typeof paginationEmits>;
export type PaginationProps = Partial<PaginationSetupProps> & PaginationEventProps;
