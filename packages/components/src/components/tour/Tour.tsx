import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement, scrollIntoView, toElement } from 'utils';
import { tourEmits, tourProps, TourStep } from './type';
import { computed, ref, watch } from 'vue';
import { useCEExpose, useCEStates, useNamespace, useOpenModel } from 'hooks';
import { defineDialog, iDialog } from '../dialog';
import { ensureNumber, isArray, runIfFn } from '@lun/utils';
import { unrefOrGet, useSetupEvent } from '@lun/core';
import { autoUpdate } from '@floating-ui/vue';
import { referenceRect } from '../popover/floating.store-rects';
import { useFloating } from '../popover/useFloating';
import { intl } from 'common';

const name = 'tour';
const parts = [] as const;
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
    useSetupEvent({
      close,
    });
    const dialogRef = ref<iDialog>(),
      currentTarget = ref();

    const { floatingStyles, middlewareData } = useFloating(currentTarget, () => dialogRef.value?.panelElement!, {
      middleware: [referenceRect()],
      whileElementsMounted: autoUpdate,
    });

    const totalSteps = computed(() => {
      const { steps } = props;
      return isArray(steps) ? steps.length : ensureNumber(steps, 0);
    });

    // Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
    let step: TourStep | undefined;
    const updateStep = async (offset: number) => {
      const { steps, scrollOptions } = props;
      if (!totalSteps.value) return false;
      let i: number;
      if (!offset) i = stepModel.value = 0;
      else if ((i = stepModel.value += offset) >= totalSteps.value || i < 0) {
        stepModel.value = 0;
        return close();
      }
      if (isArray(steps) && (step = steps[i])) {
        if ((await runIfFn(step.beforeEnter)) === false) return false;
        const el = toElement(unrefOrGet(step.target));
        if (el) {
          currentTarget.value = el;
          scrollIntoView(el, { block: 'center', ...scrollOptions });
        }
      }
    };

    watch([openModel, dialogRef], async ([open, dialog]) => {
      if (dialog) {
        if (open) {
          if ((await updateStep(0)) !== false) dialog.openDialog();
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
      const { highlightPadding } = props;
      const padding = ensureNumber(highlightPadding, 0);
      const { rects } = middlewareData.value;
      const { x, y, width, height } = rects?.reference! || {};
      const stepNow = stepModel.value,
        stepMax = totalSteps.value;
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
          <slot name="footer" slot="footer">
            {stepNow > 0 &&
              renderElement('button', { asyncHandler: prevStep, label: intl('tour.prev').d('Prev Step') })}
            {stepNow < stepMax - 1 &&
              renderElement('button', { asyncHandler: nextStep, label: intl('tour.next').d('Next Step') })}
            {stepNow === stepMax - 1 &&
              renderElement('button', { onClick: close, label: intl('tour.prev').d('Close') })}
          </slot>
        </>,
      );
    };
  },
});

export type tTour = typeof Tour;
export type TourExpose = {};
export type iTour = InstanceType<tTour> & TourExpose;

export const defineTour = createDefineElement(
  name,
  Tour,
  {
    highlightPadding: 2,
  },
  parts,
  {
    dialog: defineDialog,
  },
);
