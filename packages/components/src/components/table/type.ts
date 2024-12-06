import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  PropString,
  themeProps,
  CommonProps,
  createEmits,
  PropArray,
  Prop,
  undefBoolProp,
  PropNumber,
  PropBoolOrStr,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const tableProps = freeze({
  ...themeProps,
  data: PropArray(),
});

export const tableEmits = createEmits<{}>([]);

export type TableSetupProps = ExtractPropTypes<typeof tableProps> & CommonProps;
export type TableEvents = GetEventPropsFromEmits<typeof tableEmits>;
export type TableProps = Partial<TableSetupProps> & TableEvents;

export const tableColumnProps = freeze({
  type: PropString(),
  name: PropString(),
  plainName: undefBoolProp,
  label: Prop(),
  headColSpan: PropNumber(),
  sticky: PropBoolOrStr<boolean | 'left' | 'right'>(),
});

export const tableColumnEmits = createEmits<{}>([]);

export type TableColumnSetupProps = ExtractPropTypes<typeof tableColumnProps> & CommonProps;
export type TableColumnEvents = GetEventPropsFromEmits<typeof tableColumnEmits>;
export type TableColumnProps = Partial<TableColumnSetupProps> & TableColumnEvents;
