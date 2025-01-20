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
  /** total count of pages */
  pages: PropNumber(),
  pageSize: PropNumber(),
  /** total count of data items, should use with pageSize */
  total: PropNumber(),
  noControls: PropBoolean(),
});

export const paginationEmits = createEmits<{
  update: number;
}>(['update']);

export type PaginationSetupProps = ExtractPropTypes<typeof paginationProps> & CommonProps;
export type PaginationEventProps = GetEventPropsFromEmits<typeof paginationEmits>;
export type PaginationEventMap = GetEventMapFromEmits<typeof paginationEmits>;
export type PaginationProps = Partial<PaginationSetupProps> & PaginationEventProps;
