import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement, scrollIntoView, toElement } from 'utils';
import { tourEmits, tourProps, TourStep } from './type';
import { ref, watch } from 'vue';
import { useCEExpose, useCEStates, useNamespace, useOpenModel } from 'hooks';
import { defineDialog, iDialog } from '../dialog';
import { ensureNumber, isArray, runIfFn, virtualGetMerge } from '@lun/utils';
import { unrefOrGet, useSetupEvent } from '@lun/core';
import { useFloating } from '../popover/useFloating';
import { getCompParts, intl } from 'common';

const name = 'tour';
const parts = ['arrow'] as const;
const compParts = getCompParts(name, parts);
export const Tour = defineSSRCustomElement({
  name,
  props: tourProps,
  emits: tourEmits,
  setup(props) {
    const ns = useNamespace(name);
    const openModel = useOpenModel(props),
      stepModel = ref(0);
    const close = () => {
      openModel.value = false;
      dialogRef.value?.closeDialog();
    };
    useSetupEvent(
      {
        close,
      },
      { reEmits: ['afterOpen', 'afterClose'] },
    );
    const dialogRef = ref<iDialog>(),
      currentTarget = ref(),
      arrowRef = ref();

    const { floatingStyles, middlewareData } = useFloating(
      currentTarget,
      () => dialogRef.value?.panelElement!,
      arrowRef,
      virtualGetMerge(
        {
          get offset() {
            const { offset, highlightPadding } = props;
            return ensureNumber(highlightPadding, 0) + ensureNumber(offset, 0);
          },
        },
        props,
      ),
    );

    let step: TourStep | undefined;
    const updateStep = async (offset: number) => {
      const { steps, scrollOptions } = props;
      if (!isArray(steps) || !steps.length) return;
      let i: number;
      if (!offset) i = stepModel.value = 0;
      else if ((i = stepModel.value += offset) >= steps.length || i < 0) {
        stepModel.value = 0;
        return close();
      }
      if ((step = steps[i])) {
        if ((await runIfFn(step.beforeEnter)) === false) return;
        const el = toElement(unrefOrGet(step.target));
        if (el) {
          currentTarget.value = el;
          scrollIntoView(el, { block: 'center', ...scrollOptions });
          return true;
        }
      }
    };

    watch([openModel, dialogRef], async ([open, dialog]) => {
      if (dialog) {
        if (open) {
          if ((await updateStep(0)) === true) dialog.openDialog();
        }
      }
    });

    const [stateClass] = useCEStates(() => null, ns);
    const nextStep = () => updateStep(1),
      prevStep = () => updateStep(-1);

    useCEExpose({
      openTour: () => updateStep(0),
      nextStep,
      prevStep,
      closeTour: close,
    });

    return () => {
      const { highlightPadding, steps, showArrow } = props;
      const padding = ensureNumber(highlightPadding, 0);
      const { rects } = middlewareData.value;
      const { x, y, width, height } = rects?.reference! || {};
      const stepNow = stepModel.value,
        stepMax = isArray(steps) ? steps.length : 0;
      return renderElement(
        'dialog',
        {
          noOkBtn: true,
          noCancelBtn: true,
          class: stateClass.value,
          ref: dialogRef,
          panelStyle: floatingStyles.value,
          maskStyle: rects
            ? {
                boxSizing: 'border-box',
                borderWidth: `${y - padding}px ${innerWidth - x - width - padding}px ${
                  innerHeight - y - height - padding
                }px ${x - padding}px`,
              }
            : {},
          title: step?.title,
        },
        <>
          <slot name={stepNow}>{step?.content}</slot>
          {showArrow && <div class={ns.e('arrow')} part={compParts[0]} ref={arrowRef} />}
          <slot name="footer" slot="footer">
            {stepNow > 0 &&
              renderElement('button', { asyncHandler: prevStep, label: intl('tour.prev').d('Prev Step') })}
            {stepNow < stepMax - 1 &&
              renderElement('button', { asyncHandler: nextStep, label: intl('tour.next').d('Next Step') })}
            {stepNow === stepMax - 1 &&
              renderElement('button', { onClick: close, label: intl('tour.close').d('Close') })}
          </slot>
        </>,
      );
    };
  },
});

export type tTour = typeof Tour;
export type TourExpose = {
  openTour(): Promise<true | void>;
  nextStep(): Promise<true | void>;
  prevStep(): Promise<true | void>;
  closeTour(): void;
};
export type iTour = InstanceType<tTour> & TourExpose;

export const defineTour = createDefineElement(
  name,
  Tour,
  {
    highlightPadding: 2,
    offset: 4,
    showArrow: true,
  },
  parts,
  {
    dialog: defineDialog,
  },
);
