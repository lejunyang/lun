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
import { GetCustomRendererSource } from '../custom-renderer';
import { CommonProcessedOption } from 'hooks';

export const paginationProps = freeze({
  ...themeProps,
  ...editStateProps,
  current: PropNumber(),
  /** total number of pages */
  pages: PropNumber(),
  pageSize: PropNumber(),
  pageSizeOptions: PropArray<(number | CommonProcessedOption<number>)[]>(),
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
   * `detail`: display current page and total number\
   * `sizes`: dropdown to select the page size
   * @default ['prev', 'pages', 'next']
   */
  controls:
    PropArray<
      (
        | 'prev'
        | 'pages'
        | 'next'
        | 'sizes'
        | 'detail'
        | GetCustomRendererSource<
            [{ pageSize: number | undefined; total: number | undefined; pages: number; current: number }]
          >
      )[]
    >(),
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
