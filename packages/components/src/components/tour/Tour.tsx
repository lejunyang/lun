import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement, scrollIntoView, toElement } from 'utils';
import { tourEmits, tourProps, TourStep } from './type';
import { reactive, ref, watch } from 'vue';
import { useCEExpose, useCEStates, useNamespace, useOpenModel } from 'hooks';
import { defineDialog, iDialog } from '../dialog';
import { ensureNumber, extend, isArray, isElement, runIfFn } from '@lun-web/utils';
import { createPopoverRectTarget, unrefOrGet, useSetupEvent } from '@lun-web/core';
import { useFloating } from '../popover/useFloating';
import { getCompParts, intl } from 'common';
import { hasRect } from '../popover/utils';

const name = 'tour';
const parts = ['arrow'] as const;
const compParts = getCompParts(name, parts);
export const Tour = defineCustomElement({
  name,
  props: tourProps,
  emits: tourEmits,
  setup(props, { emit: e }) {
    const ns = useNamespace(name);
    const close = () => {
      openModel.value = false;
      dialogRef.value?.closeDialog();
    };
    const emit = useSetupEvent<typeof e>(
      {
        close,
      },
      { reEmits: ['afterOpen', 'afterClose'] },
    );
    const openModel = useOpenModel(props),
      stepModel = ref(0);
    const dialogRef = ref<iDialog>(),
      currentTarget = ref(),
      arrowRef = ref();

    const { floatingStyles, middlewareData, placement, placementInfo } = useFloating(
      currentTarget,
      () => dialogRef.value?.panelElement!,
      arrowRef,
      extend(props, {
        get offset() {
          const { offset, highlightPadding } = props;
          return ensureNumber(highlightPadding, 0) + ensureNumber(offset, 0);
        },
      }),
    );

    const stepState = reactive({
      step: undefined as TourStep | undefined,
      hasTarget: undefined as any,
    });
    const updateStep = async (offset: number) => {
      const { steps, scrollOptions } = props;
      if (!isArray(steps) || !steps.length) return;
      let i: number;
      if (!offset) i = stepModel.value = 0;
      else if ((i = stepModel.value += offset) >= steps.length || i < 0) {
        stepModel.value = 0;
        return close();
      }
      let step: TourStep;
      if ((step = steps[i])) {
        emit('updateStep', step);
        const target = unrefOrGet(step.target);
        const el = hasRect(target) ? target : toElement(target as any);
        if ((await runIfFn(step.beforeEnter)) === false) return;
        stepState.step = step;
        stepState.hasTarget = el;
        currentTarget.value = el || createPopoverRectTarget(() => [innerWidth / 2, innerHeight / 2]);
        if (isElement(el)) scrollIntoView(el, { block: 'center', ...scrollOptions, ...step.scrollOptions });
        return true;
      }
    };

    watch([openModel, dialogRef], async ([open, dialog], [_, oldDialog]) => {
      if (dialog) {
        if (open) {
          if ((await updateStep(0)) === true) dialog.openDialog();
        } else if (oldDialog) close(); // check oldDialog in case close is call onMounted
      }
    });

    const [stateClass] = useCEStates(() => ({
      [`placement-${placement.value}`]: 1,
      [`side-${placementInfo.value[0]}`]: 1,
    }));
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
      const { step, hasTarget } = stepState;
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
                borderWidth: hasTarget
                  ? `${y - padding}px ${innerWidth - x - width - padding}px ${innerHeight - y - height - padding}px ${
                      x - padding
                    }px`
                  : `${innerHeight}px ${innerWidth}px`,
              }
            : {},
          title: step?.title,
        },
        <>
          <slot name={stepNow}>{step?.content}</slot>
          {showArrow && hasTarget && <div class={ns.e('arrow')} part={compParts[0]} ref={arrowRef} />}
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
    placement: 'top',
    flip: true,
    shift: true,
  },
  parts,
  {
    dialog: defineDialog,
  },
);
