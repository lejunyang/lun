import {
  capitalize,
  createBinds,
  fromObject,
  isFunction,
  isHTMLElement,
  isString,
  iterateEventPath,
  objectKeys,
} from '@lun-web/utils';
import { TableColumnCollectorContext } from './collector';
import { TableActionKeys } from './type';
import { getProp, getProps } from 'utils';
import { fComputed } from '@lun-web/core';
import { InternalColumn, InternalRowInfo, InternalTableActionParams } from './internalType';

export default (column: () => InternalColumn, context: TableColumnCollectorContext) => {
  const checkTarget = (target: EventTarget | null) => {
    if (!isHTMLElement(target)) return;
    const { role } = target,
      { renderIndex } = target.dataset;
    if (role === 'cell' && renderIndex) {
      return context.data()[renderIndex as any as number];
    }
  };

  const tableActions: Record<TableActionKeys, (params: InternalTableActionParams) => void> = {
    toggleRowExpand: ({ key }) => {
      context.rowExpand.toggleExpand(key);
    },
  };

  const normalizeActionKey = (event: string, target: 'Cell' | 'Row' = 'Cell') => 'on' + target + capitalize(event);

  const rowInfoToParams = (rowInfo: InternalRowInfo) => {
    const params = { row: rowInfo[0], index: rowInfo[1], key: rowInfo[2], props: getProps(column()) };
    return {
      ...params,
      get actions() {
        return createBinds(tableActions, objectKeys(tableActions), params) as Record<TableActionKeys, () => void>;
      },
    };
  };

  const resolveAction = (action: string | ((params: InternalTableActionParams) => void)) =>
    isString(action) && tableActions[action] ? tableActions[action] : isFunction(action) ? action : undefined;

  const normalizeActions = (actions: any, target: 'Cell' | 'Row' = 'Cell') => {
    if (!actions) return;
    const action = resolveAction(actions);
    return action
      ? {
          [normalizeActionKey('click', target)]: action,
        }
      : (fromObject(actions, (key, value) => [key, resolveAction(value)]) as Record<
          string,
          (params: InternalTableActionParams) => void
        >);
  };

  const getColActions = fComputed(() => normalizeActions(getProp(column(), 'actions'))),
    getTableActions = fComputed(() => normalizeActions(context.parent!.props.actions, 'Row'));

  const handlers: Record<string, (event: Event) => void> = {};
  const createHandler = (event: string) => {
    const eventKey = 'on' + capitalize(event),
      cellKey = normalizeActionKey(event),
      tableKey = normalizeActionKey(event, 'Row');
    handlers[eventKey] = (e) => {
      const colAction = getColActions()?.[cellKey],
        tableAction = getTableActions()?.[tableKey];
      if (!colAction && !tableAction) return;
      iterateEventPath(e, (target) => {
        const rowInfo = checkTarget(target);
        if (rowInfo) {
          colAction?.(rowInfoToParams(rowInfo));
          tableAction?.(rowInfoToParams(rowInfo));
          return true;
        }
      });
    };
  };

  ['click', 'dblclick', 'contextmenu'].forEach(createHandler);

  return handlers;
};
