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
});

export const tableColumnEmits = createEmits<{}>([]);

export type TableColumnSetupProps = ExtractPropTypes<typeof tableProps> & CommonProps;
export type TableColumnEvents = GetEventPropsFromEmits<typeof tableEmits>;
export type TableColumnProps = Partial<TableSetupProps> & TableEvents;
