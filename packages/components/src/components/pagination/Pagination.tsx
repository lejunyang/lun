import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { paginationEmits, paginationProps } from './type';
import { useCurrentModel, useNamespace } from 'hooks';
import { ElementWithExpose, getCompParts, intl } from 'common';
import { fComputed, useSetupEdit } from '@lun-web/core';
import { arrayFrom, ensureArray, ensureNumber, isArray, isNumber, runIfFn, toNumberOrUndefined } from '@lun-web/utils';
import { defineIcon } from '../icon';
import { VNodeChild } from 'vue';
import { renderCustom } from '../custom-renderer';
import { defineSelect } from '../select';

const name = 'pagination';
const parts = ['root', 'button', 'total'] as const;
const compParts = getCompParts(name, parts);
export const Pagination = defineCustomElement({
  name,
  props: paginationProps,
  emits: paginationEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const current = useCurrentModel(props),
      currentPage = fComputed(() => ensureNumber(current.value, 1));
    const pageSize = fComputed(() => toNumberOrUndefined(props.pageSize)),
      total = fComputed(() => toNumberOrUndefined(props.total));
    const totalPages = fComputed(() => {
      return ensureNumber(Math.ceil(total()! / pageSize()!), ensureNumber(props.pages, 1));
    });
    const pageSizeOptions = fComputed(() =>
      ensureArray(props.pageSizeOptions ?? [10, 20, 50, 100]).map((i) =>
        isNumber(i) ? { value: i, label: intl('pagination.sizeLabel', { size: i }).d(`${i} / page`) } : i,
      ),
    );

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

    const controlRenderMap: Record<string, () => VNodeChild> = {
      prev: () => <button {...prevButtonProps()}>{renderElement('icon', { name: 'left' })}</button>,
      pages: () => {
        const { siblings, boundaries } = props,
          siblingsNum = ensureNumber(siblings, 1),
          boundariesNum = ensureNumber(boundaries, 1);
        const pages = totalPages(),
          current = currentPage(),
          // "2" represents the min count in dots
          minCount = boundariesNum + 2 + siblingsNum,
          needLeftDots = current - siblingsNum - boundariesNum > 2 && pages - boundariesNum > minCount,
          needRightDots = current + siblingsNum + boundariesNum < pages - 1;
        return arrayFrom(pages, (_, i) => {
          if (needLeftDots) {
            if (i === boundariesNum) return <button {...prevJumpButtonProps()}>...</button>;
            if (i < current - siblingsNum - 1 && i > boundariesNum) return null;
          }
          if (needRightDots && i < pages - boundariesNum && i > minCount) {
            if (i === pages - boundariesNum - 1) return <button {...nextJumpButtonProps()}>...</button>;
            if (i >= current + siblingsNum) return null;
          }
          return <button {...getBtnProps(() => update(i + 1), false, i + 1)}>{i + 1}</button>;
        });
      },
      next: () => <button {...nextButtonProps()}>{renderElement('icon', { name: 'right' })}</button>,
      detail: () => {
        const size = pageSize(),
          current = currentPage();
        return (
          <span class={ns.e('total')} part={compParts[2]}>
            {size
              ? `${(current - 1) * size + 1} - ${current * size} / ${total() ?? totalPages() * size}`
              : `${current} / ${totalPages()}`}
          </span>
        );
      },
      sizes: () => {
        return renderElement('select', {
          value: pageSize(),
          clickOption: 'select',
          onUpdate(e: CustomEvent<{ raw: number }>) {
            emit('pageSizeUpdate', +e.detail.raw);
          },
          options: pageSizeOptions(),
        });
      },
    };

    return () => {
      const { controls } = props,
        finalControls = isArray(controls) ? controls : ['prev', 'pages', 'next'];
      return (
        <div class={ns.t} part={compParts[0]}>
          {finalControls.map((control) => {
            const render = controlRenderMap[control as any];
            if (render) return render();
            else if (control)
              return renderCustom(
                runIfFn(control, {
                  pageSize: pageSize(),
                  total: total(),
                  pages: totalPages(),
                  current: currentPage(),
                }),
              );
          })}
        </div>
      );
    };
  },
});

export type PaginationExpose = {};
export type tPagination = ElementWithExpose<typeof Pagination, PaginationExpose>;
export type iPagination = InstanceType<tPagination>;

export const definePagination = createDefineElement(name, Pagination, {}, parts, [defineIcon, defineSelect]);
