import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement, toElement } from 'utils';
import { tourEmits, tourProps, TourStep } from './type';
import { ref, watch } from 'vue';
import { useNamespace, useOpenModel } from 'hooks';
import { defineDialog, iDialog } from '../dialog';
import { isArray, setStyle } from '@lun/utils';
import { unrefOrGet, useSetupEvent } from '@lun/core';
import { computePosition } from '@floating-ui/vue';
import { referenceRect } from '../popover/floating.store-rects';

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

    const start = () => {
      const { steps } = props;
      let step: TourStep;
      console.log('steps', steps);
      if (isArray(steps) && (step = steps[stepModel.value])) {
        const el = toElement(unrefOrGet(step.target));
        if (el) {
          currentTarget.value = el;
        }
      }
    };

    const update = () => {
      const pop = dialogRef.value!.panelElement!;
      computePosition(currentTarget.value, pop, {
        middleware: [referenceRect()],
        placement: 'bottom',
        strategy: 'absolute',
      }).then((position) => {
        // position.middlewareData.rects?.reference
        setStyle(pop, {
          top: `${position.y}px`,
          left: `${position.x}px`,
        });
      });
    };

    watch([openModel, dialogRef], ([open, dialog]) => {
      if (dialog) {
        if (open) {
          start();
          dialog.openDialog();
          update();
        }
      }
    });
    return () => {
      return renderElement('dialog', {
        ref: dialogRef,
        open: openModel.value,
      });
    };
  },
});

export type tTour = typeof Tour;
export type TourExpose = {};
export type iTour = InstanceType<tTour> & TourExpose;

export const defineTour = createDefineElement(name, Tour, {}, parts, {
  dialog: defineDialog,
});
