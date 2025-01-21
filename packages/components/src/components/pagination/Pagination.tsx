import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { paginationEmits, paginationProps } from './type';
import { useCurrentModel, useNamespace } from 'hooks';
import { ElementWithExpose, getCompParts } from 'common';
import { fComputed, useSetupEdit } from '@lun-web/core';
import { arrayFrom, ensureNumber } from '@lun-web/utils';
import { defineIcon } from '../icon';

const name = 'pagination';
const parts = ['root', 'button'] as const;
const compParts = getCompParts(name, parts);
export const Pagination = defineCustomElement({
  name,
  props: paginationProps,
  emits: paginationEmits,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const current = useCurrentModel(props),
      currentPage = fComputed(() => ensureNumber(current.value, 1));
    const totalPages = fComputed(() => {
      const { pages, total, pageSize } = props;
      return ensureNumber((total as number) / (pageSize as number), ensureNumber(pages, 1));
    });

    const canPrev = () => currentPage() > 1,
      canNext = () => currentPage() < totalPages();
    const update = (index: number) => {
      if (editComputed.editable) current.value = index;
    };
    const prev = () => {
      if (canPrev()) update(currentPage() - 1);
    };
    const next = () => {
      if (canNext()) update(currentPage() + 1);
    };

    return () => {
      const { noControls } = props;
      const { editable } = editComputed;
      return (
        <div class={ns.t} part={compParts[0]}>
          {!noControls && (
            <button
              class={[ns.e('button'), ns.is('disabled', !canPrev())]}
              part={compParts[1]}
              onClick={prev}
              disabled={!canPrev() || !editable}
            >
              {renderElement('icon', { name: 'left' })}
            </button>
          )}
          {arrayFrom(totalPages(), (_, i) => (
            <button
              class={[ns.e('button'), ns.is('disabled', !editable), ns.is('active', i + 1 === currentPage())]}
              part={compParts[1]}
              onClick={() => update(i + 1)}
              disabled={!editable}
            >
              {i + 1}
            </button>
          ))}
          {!noControls && (
            <button
              class={[ns.e('button'), ns.is('disabled', !canNext())]}
              part={compParts[1]}
              onClick={next}
              disabled={!canNext() || !editable}
            >
              {renderElement('icon', { name: 'right' })}
            </button>
          )}
        </div>
      );
    };
  },
});

export type PaginationExpose = {};
export type tPagination = ElementWithExpose<typeof Pagination, PaginationExpose>;
export type iPagination = InstanceType<tPagination>;

export const definePagination = createDefineElement(name, Pagination, {}, parts, [defineIcon]);
