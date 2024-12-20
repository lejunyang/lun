import { AnyObject } from '@lun-web/utils';
import { TableSetupProps } from './type';

export const getRowKey = (props: TableSetupProps, row: unknown, index: number) => {
  const { dataPropsMap } = props,
    keyProp = dataPropsMap?.key || 'key';
  return (row as AnyObject)[keyProp] ?? index;
};
