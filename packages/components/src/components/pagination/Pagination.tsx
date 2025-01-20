import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { paginationEmits, paginationProps } from './type';
import { useCurrentModel, useNamespace } from 'hooks';
import { ElementWithExpose, getCompParts } from 'common';
import { defineButton } from '../button';
import { fComputed, useSetupEdit } from '@lun-web/core';
import { arrayFrom, ensureNumber } from '@lun-web/utils';

const name = 'pagination',
  button = 'button';
const parts = ['root'] as const;
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

    const update = (index: number) => {
      if (editComputed.editable) current.value = index;
    };
    const prev = () => {
      const current = currentPage();
      if (current > 1) update(current - 1);
    };
    const next = () => {
      const current = currentPage();
      if (current < totalPages()) update(current + 1);
    };

    return () => {
      const { noControls } = props;
      return (
        <div class={ns.t} part={compParts[0]}>
          {!noControls &&
            renderElement(button, {
              asyncHandler: prev,
              iconName: 'left',
            })}
          {arrayFrom(totalPages(), (_, i) =>
            renderElement(
              button,
              {
                asyncHandler: () => update(i + 1),
              },
              i + 1,
            ),
          )}
          {!noControls &&
            renderElement(button, {
              asyncHandler: next,
              iconName: 'right',
            })}
        </div>
      );
    };
  },
});

export type PaginationExpose = {};
export type tPagination = ElementWithExpose<typeof Pagination, PaginationExpose>;
export type iPagination = InstanceType<tPagination>;

export const definePagination = createDefineElement(name, Pagination, {}, parts, [defineButton]);
