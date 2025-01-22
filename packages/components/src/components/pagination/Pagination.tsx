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
      return ensureNumber(Math.ceil((total as number) / (pageSize as number)), ensureNumber(pages, 1));
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
    const jumpPrev = () => update(currentPage() - ensureNumber(props.dotsJump, 5));
    const jumpNext = () => update(currentPage() + ensureNumber(props.dotsJump, 5));

    const getBtnProps = (onClick: () => void, disabled?: (() => boolean) | false, index?: number) => {
      const finalDisabled = !editComputed.editable || (disabled && disabled());
      return {
        class: [ns.e('button'), ns.is('disabled', finalDisabled), ns.is('current', index === currentPage())],
        part: compParts[1],
        onClick: onClick,
        disabled: finalDisabled,
      };
    };
    const prevButtonProps = fComputed(() => getBtnProps(prev, () => !canPrev())),
      nextButtonProps = fComputed(() => getBtnProps(next, () => !canNext())),
      prevJumpButtonProps = fComputed(() => getBtnProps(jumpPrev)),
      nextJumpButtonProps = fComputed(() => getBtnProps(jumpNext));

    return () => {
      const { noControls, siblings, boundaries } = props,
        siblingsNum = ensureNumber(siblings, 1),
        boundariesNum = ensureNumber(boundaries, 1);
      const pages = totalPages(),
        current = currentPage(),
        // "2" represents the min count in dots
        minCount = boundariesNum + 2 + siblingsNum,
        needLeftDots = current - siblingsNum - boundariesNum > 2 && pages - boundariesNum > minCount,
        needRightDots = current + siblingsNum + boundariesNum < pages - 1;
      return (
        <div class={ns.t} part={compParts[0]}>
          {!noControls && <button {...prevButtonProps()}>{renderElement('icon', { name: 'left' })}</button>}
          {arrayFrom(pages, (_, i) => {
            if (needLeftDots) {
              if (i === boundariesNum) return <button {...prevJumpButtonProps()}>...</button>;
              if (i < current - siblingsNum - 1 && i > boundariesNum) return null;
            }
            if (needRightDots && i < pages - boundariesNum && i > minCount) {
              if (i === pages - boundariesNum - 1) return <button {...nextJumpButtonProps()}>...</button>;
              if (i >= current + siblingsNum) return null;
            }
            return <button {...getBtnProps(() => update(i + 1), false, i + 1)}>{i + 1}</button>;
          })}
          {!noControls && <button {...nextButtonProps()}>{renderElement('icon', { name: 'right' })}</button>}
        </div>
      );
    };
  },
});

export type PaginationExpose = {};
export type tPagination = ElementWithExpose<typeof Pagination, PaginationExpose>;
export type iPagination = InstanceType<tPagination>;

export const definePagination = createDefineElement(name, Pagination, {}, parts, [defineIcon]);
