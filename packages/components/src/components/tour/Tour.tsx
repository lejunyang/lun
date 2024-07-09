import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement, scrollIntoView, toElement } from 'utils';
import { tourEmits, tourProps, TourStep } from './type';
import { ref, watch } from 'vue';
import { useCEExpose, useCEStates, useNamespace, useOpenModel } from 'hooks';
import { defineDialog, iDialog } from '../dialog';
import { ensureNumber, isArray } from '@lun/utils';
import { unrefOrGet, useSetupEvent } from '@lun/core';
import { autoUpdate } from '@floating-ui/vue';
import { referenceRect } from '../popover/floating.store-rects';
import { useFloating } from '../popover/useFloating';

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
    useSetupEvent();
    const dialogRef = ref<iDialog>(),
      currentTarget = ref();

    const { floatingStyles, middlewareData } = useFloating(currentTarget, () => dialogRef.value?.panelElement!, {
      middleware: [referenceRect()],
      whileElementsMounted: autoUpdate,
    });

    const updateStep = (offset: number) => {
      const { steps, scrollOptions } = props;
      const totalSteps = isArray(steps) ? steps.length : ensureNumber(steps, 0);
      if (!totalSteps) return;
      let i: number, step: TourStep;
      if (!offset) i = stepModel.value = 0;
      else if ((i = stepModel.value += offset) >= totalSteps || i < 0) {
        stepModel.value = 0;
        return (openModel.value = false);
      }
      if (isArray(steps) && (step = steps[i])) {
        const el = toElement(unrefOrGet(step.target));
        if (el) {
          scrollIntoView(el, scrollOptions);
          currentTarget.value = el;
        }
      }
    };

    watch([openModel, dialogRef], ([open, dialog]) => {
      if (dialog) {
        if (open) {
          updateStep(0);
          dialog.openDialog();
        }
      }
    });

    const [stateClass] = useCEStates(() => null, ns);
    useCEExpose({
      startStep: () => updateStep(0),
      nextStep: () => updateStep(1),
      prevStep: () => updateStep(-1),
    });

    return () => {
      const { highlightPadding } = props;
      const padding = ensureNumber(highlightPadding, 0);
      const { rects } = middlewareData.value;
      const { x, y, width, height } = rects?.reference! || {};
      return renderElement('dialog', {
        class: stateClass.value,
        ref: dialogRef,
        open: openModel.value,
        panelStyle: floatingStyles.value,
        maskStyle: rects
          ? {
              boxSizing: 'border-box',
              borderWidth: `${y - padding}px ${innerWidth - x - width - padding}px ${
                innerHeight - y - height - padding
              }px ${x - padding}px`,
            }
          : {},
      });
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
