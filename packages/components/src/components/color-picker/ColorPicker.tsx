import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { colorPickerEmits, colorPickerProps } from './type';
import { iPopover } from '../popover';
import { useDraggableArea, useSetupEdit, useSetupEvent } from '@lun/core';
import { useCEStates, useNamespace, useValueModel } from 'hooks';
import { computed, reactive, ref } from 'vue';
import { defineSelect } from '../select';
import { getCompParts } from 'common';
import { defineRange } from '../range';
import { hsbToHsl } from '@lun/utils';

const name = 'color-picker';
const parts = ['panel', 'palette', 'wrapper', 'hue', 'alpha', 'preview', 'saturation', 'thumb', 'ranges'] as const;
const compParts = getCompParts(name, parts);

const hueArr = [];
for (let i = 0; i <= 360; i += 60) {
  hueArr.push(`hsl(${i} 100 50)`);
}
const hueBackground = `linear-gradient(to right,${hueArr})`;
const saturationImage = `linear-gradient(0deg,rgb(0 0 0),transparent), linear-gradient(90deg,rgb(255 255 255),rgb(255 255 255/0))`;

export const ColorPicker = defineSSRCustomElement({
  name,
  formAssociated: true,
  props: colorPickerProps,
  emits: colorPickerEmits,
  setup(props, { emit: e }) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    useSetupEvent<typeof e>();
    const valueModel = useValueModel(props);
    const popoverRef = ref<iPopover>(),
      paletteRef = ref<HTMLElement>(),
      thumb = ref<HTMLElement>();

    const [stateClass] = useCEStates(() => null, ns);
    const railStyle = { background: hueBackground },
      trackStyle = { opacity: 0 };
    const thumbState = reactive({
      left: 0,
      top: 1,
      relativeX: 0,
      relativeY: 0,
    });
    const thumbStyle = computed(() => {
      const { left, top, relativeX, relativeY } = thumbState;
      return {
        position: 'absolute' as const,
        left: left * 100 + '%',
        top: top * 100 + '%',
        transform: `translate(calc(${relativeX}px - 50%), calc(${relativeY}px - 50%))`,
      };
    });

    const hsla = reactive([0, 100, 50, 100]);
    const getColor = (alpha?: boolean) => {
      const [h, s, l, a] = hsla;
      return `hsl(${h} ${s} ${l}${alpha ? `/${a}%` : ''})`;
    };
    const color = computed(() => getColor(true));

    const targetStates = useDraggableArea({
      el: paletteRef,
      disabled: () => !editComputed.editable,
      draggable: (target, { offsetX, offsetY }) => {
        const drag = target === thumb.value;
        if (!drag) {
          // click
          const { offsetWidth, offsetHeight } = paletteRef.value!;
          const saturation = offsetX / offsetWidth,
            top = offsetY / offsetHeight,
            brightness = (1 - top) * 100;
          Object.assign(thumbState, {
            left: saturation,
            top,
            relativeX: 0,
            relativeY: 0,
          });
          targetStates.delete(thumb.value!);
          console.log('hsla', hsla, offsetX, offsetWidth, offsetY, offsetHeight, { saturation, brightness });
          Object.assign(hsla, hsbToHsl(hsla[0], saturation * 100, brightness));
          console.log('after hsla', hsla);
        }
        return drag;
      },
      limitInContainer: 'center',
      onMove(_, { relativeX, relativeY }) {
        Object.assign(thumbState, { relativeX, relativeY });
      },
    });

    const hueRangeProps = {
      class: ns.e('hue'),
      part: compParts[3],
      railStyle,
      trackStyle,
      max: 360,
      onUpdate({ detail }: CustomEvent) {
        hsla[0] = detail;
        valueModel.value = color.value;
      },
    };
    const alphaRangeProps = {
      class: ns.e('alpha'),
      part: compParts[4],
      max: 100,
      trackStyle,
      onUpdate({ detail }: CustomEvent) {
        hsla[3] = detail;
        valueModel.value = color.value;
      },
    };
    const triggers = ['click', 'focus'];
    return () => {
      const { popoverProps } = props;
      return renderElement(
        'popover',
        {
          placement: 'bottom-start',
          ...popoverProps,
          class: stateClass.value,
          showArrow: false,
          ref: popoverRef,
          triggers,
        },
        <>
          <slot></slot>
          <div class={ns.e('panel')} part={compParts[0]} slot="pop-content">
            <div class={ns.e('palette')} part={compParts[1]} ref={paletteRef}>
              <div
                class={ns.e('saturation')}
                part={compParts[6]}
                style={{
                  backgroundColor: `hsl(${hsla[0]} 100 50)`,
                  backgroundImage: saturationImage,
                }}
              ></div>
              <div class={ns.e('thumb')} part={compParts[7]} ref={thumb} style={thumbStyle.value}></div>
            </div>
            <div class={ns.e('wrapper')} part={compParts[2]}>
              <div class={ns.e('preview')} part={compParts[5]} style={{ background: color.value }}></div>
              <div class={ns.e('ranges')} part={compParts[8]}>
                {renderElement('range', { ...hueRangeProps, value: hsla[0] })}
                {renderElement('range', {
                  ...alphaRangeProps,
                  value: hsla[3],
                  railStyle: {
                    background: `linear-gradient(to right,rgb(255 0 4/0%),${color.value})`,
                  },
                })}
              </div>
            </div>
          </div>
        </>,
      );
    };
  },
});

export type tColorPicker = typeof ColorPicker;
export type iColorPicker = InstanceType<tColorPicker>;

export const defineColorPicker = createDefineElement(name, ColorPicker, {}, parts, {
  select: defineSelect,
  range: defineRange,
});
