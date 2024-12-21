import { capitalize, fromObject, isFunction, isHTMLElement, isString, iterateEventPath } from '@lun-web/utils';
import { TableProvideExtra } from './collector';
import { TableColumnSetupProps } from './type';
import { getProp, getProps } from 'utils';
import { fComputed } from '@lun-web/core';
import { InternalColumn, InternalRowInfo, InternalTableActionParams } from './internalType';

export default (column: () => InternalColumn, context: TableProvideExtra) => {
  const checkTarget = (target: EventTarget | null) => {
    if (!isHTMLElement(target)) return;
    const { role } = target,
      { renderIndex } = target.dataset;
    if (role === 'cell' && renderIndex) {
      return context.data()[renderIndex as any as number];
    }
  };

  const tableActions: Record<string, (params: InternalTableActionParams) => void> = {
    toggleRowExpand: ({ key }) => {
      context.rowExpand.toggleExpand(key);
    },
  };

  const normalizeActionKey = (event: string, target: 'Cell' | 'Row' = 'Cell') => 'on' + target + capitalize(event);

  const rowInfoToParams = (rowInfo: InternalRowInfo) => ({
    row: rowInfo[0],
    index: rowInfo[1],
    key: rowInfo[2],
    props: getProps(column()),
  });

  const resolveAction = (action: string | ((params: InternalTableActionParams) => void)) =>
    isString(action) && tableActions[action] ? tableActions[action] : isFunction(action) ? action : undefined;

  const normalizeActions = (actions: TableColumnSetupProps['actions'], target: 'Cell' | 'Row' = 'Cell') => {
    if (!actions) return;
    const action = resolveAction(actions as any);
    return action
      ? {
          [normalizeActionKey('click', target)]: action,
        }
      : (fromObject(actions as any, (key, value) => [key, resolveAction(value)]) as Record<
          string,
          (params: InternalTableActionParams) => void
        >);
  };

  const getColActions = fComputed(() => normalizeActions(getProp(column(), 'actions')));

  const handlers: Record<string, (event: Event) => void> = {};
  const createHandler = (event: string) => {
    const eventKey = 'on' + capitalize(event),
      cellKey = normalizeActionKey(event);
    handlers[eventKey] = (e) => {
      const colActions = getColActions();
      if (!colActions || !colActions[cellKey]) return;
      iterateEventPath(e, (target) => {
        const rowInfo = checkTarget(target);
        if (rowInfo) {
          colActions[cellKey](rowInfoToParams(rowInfo));
          return true;
        }
      });
    };
  };

  ['click', 'dblclick', 'contextmenu'].forEach(createHandler);

  return handlers;
};
