import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { colorPickerEmits, colorPickerProps } from './type';
import { iPopover } from '../popover';
import { useSetupEdit, useSetupEvent } from '@lun/core';
import { useCEStates, useNamespace, useValueModel } from 'hooks';
import { computed, ref } from 'vue';
import { defineSelect } from '../select';
import { getCompParts } from 'common';
import { defineRange } from '../range';

const name = 'color-picker';
const parts = ['panel', 'palette', 'wrapper', 'hue', 'alpha', 'preview', 'saturation', 'indicator'] as const;
const compParts = getCompParts(name, parts);

const hueArr = [];
for (let i = 0; i <= 360; i += 60) {
  hueArr.push(`hsl(${i} 100 50)`);
}
const hueBackground = `linear-gradient(to right,${hueArr})`;
const saturationImage = `linear-gradient(0deg,rgb(0 0 0),transparent), linear-gradient(90deg,rgb(255 255 255),rgba(255 255 255 0))`;

export const ColorPicker = defineSSRCustomElement({
  name,
  formAssociated: true,
  props: colorPickerProps,
  emits: colorPickerEmits,
  setup(props, { emit: e }) {
    const ns = useNamespace(name);
    useSetupEdit();
    useSetupEvent<typeof e>();
    const valueModel = useValueModel(props);
    const popoverRef = ref<iPopover>();

    const [stateClass] = useCEStates(() => null, ns);
    const railStyle = { background: hueBackground },
      trackStyle = { opacity: 0 };

    const hueNum = ref(0),
      alphaNum = ref(100);
    const colorNoAlpha = computed(() => `hsl(${hueNum.value} 100 50)`);
    const color = computed(() => `hsl(${hueNum.value} 100 50/${alphaNum.value}%)`);

    const hueRangeProps = {
      class: ns.e('hue'),
      part: compParts[3],
      railStyle,
      trackStyle,
      max: 360,
      onUpdate({ detail }: CustomEvent) {
        hueNum.value = detail;
        valueModel.value = color.value;
      },
    };
    const alphaRangeProps = {
      class: ns.e('alpha'),
      part: compParts[4],
      max: 100,
      onUpdate({ detail }: CustomEvent) {
        alphaNum.value = detail;
        valueModel.value = color.value;
      },
    };
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
          triggers: ['click', 'focus'],
        },
        <>
          <slot></slot>
          <div class={ns.e('panel')} part={compParts[0]} slot="pop-content">
            <div class={ns.e('palette')} part={compParts[1]}>
              <div
                class={ns.e('saturation')}
                part={compParts[6]}
                style={{
                  backgroundColor: colorNoAlpha.value,
                  backgroundImage: saturationImage,
                }}
              ></div>
              <span class={ns.e('indicator')} part={compParts[7]}></span>
            </div>
            <div class={ns.e('wrapper')} part={compParts[2]}>
              {renderElement('range', { ...hueRangeProps, value: hueNum.value })}
              {renderElement('range', { ...alphaRangeProps, value: alphaNum.value })}
              <span class={ns.e('preview')} part={compParts[5]} style={{ background: color.value }}></span>
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
