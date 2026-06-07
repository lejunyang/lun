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
  /**
   * @locale.zh-CN 当前页码，从 1 开始计数，支持 v-model 双向绑定
   * @locale.en Current page number, starting from 1. Supports v-model two-way binding.
   */
  current: PropNumber(),
  /**
   * @locale.zh-CN 总页数，可直接通过该属性设置
   * @locale.en Total number of pages, can be set directly via this prop.
   */
  pages: PropNumber(),
  /**
   * @locale.zh-CN 每页显示的条数，与 total 配合可计算出总页数
   * @locale.en Number of items per page. Combined with total to calculate pages.
   */
  pageSize: PropNumber(),
  /**
   * @locale.zh-CN 每页条数选项列表，用于 sizes 控件中的下拉选择
   * @locale.en List of page size options used by the sizes dropdown control.
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions: PropArray<(number | CommonProcessedOption<number>)[]>(),
  /**
   * @locale.zh-CN 数据总条数，需配合 pageSize 计算出总页数；若 total 与 pageSize 均有效，则优先于 pages 生效
   * @locale.en Total number of data items, should be used with pageSize to calculate pages. If total and pageSize are valid, they take precedence over pages.
   */
  total: PropNumber(),
  /**
   * @locale.zh-CN 当前页码按钮与省略号快速跳转按钮之间，左右两侧分别显示的页码按钮数量
   * @locale.en The number of page buttons to display on each side between the current page button and the dots quick-jump button.
   * @default 1
   */
  siblings: PropNumber(),
  /**
   * @locale.zh-CN 省略号快速跳转按钮外侧（首尾边界）显示的页码按钮数量
   * @locale.en The number of page buttons to display on the left/right boundary before/after the dots quick-jump button.
   * @default 1
   */
  boundaries: PropNumber(),
  /**
   * @locale.zh-CN 自定义分页器渲染内容及顺序的数组，可选值：prev 上一页按钮，pages 页码列表，next 下一页按钮，detail 当前页与总数信息，sizes 每页条数下拉框；也可传入 CustomRenderer 自定义内容
   * @locale.en Array that determines the content and order to render. Available values: prev (previous page button), pages (page buttons), next (next page button), detail (current page and total info), sizes (page size dropdown). Custom renderers are also supported.
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
   * @locale.zh-CN 点击省略号按钮时一次性跳转的页数
   * @locale.en Number of pages to jump when clicking the dots quick-jump button.
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
