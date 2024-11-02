import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { colorPickerEmits, colorPickerProps } from './type';
import { iPopover } from '../popover';
import { useDraggableArea, useSetupEdit, useSetupEvent } from '@lun-web/core';
import { useCEStates, useNamespace, useValueModel } from 'hooks';
import { computed, nextTick, reactive, ref, watchEffect } from 'vue';
import { defineSelect } from '../select';
import { getCompParts } from 'common';
import { defineRange } from '../range';
import { hsbToHsl, hslToHsb, isArray, pick } from '@lun-web/utils';

const name = 'color-picker';
const parts = ['panel', 'palette', 'wrapper', 'hue', 'alpha', 'preview', 'saturation', 'thumb', 'ranges'] as const;
const compParts = getCompParts(name, parts);

const hueArr = [];
for (let i = 0; i <= 360; i += 60) {
  hueArr.push(`hsl(${i} 100% 50%)`); // must add '%'. it becomes optional in high browser version.
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

    const railStyle = { background: hueBackground },
      trackStyle = { opacity: 0 };
    const thumbState = reactive(
      {} as {
        left: number;
        top: number;
        relativeX: number;
        relativeY: number;
      },
    );
    const resetThumb = (left = 1, top: number = 0) => {
      Object.assign(thumbState, {
        left,
        top,
        relativeX: 0,
        relativeY: 0,
      });
    };
    resetThumb();
    const thumbStyle = computed(() => {
      const { left, top, relativeX, relativeY } = thumbState;
      return {
        position: 'absolute' as const,
        left: left * 100 + '%',
        top: top * 100 + '%',
        transform: `translate(calc(${relativeX}px - 50%), calc(${relativeY}px - 50%))`,
      };
    });

    const hsla = reactive([360, 100, 50, 100]);
    let updated = false;
    const updateSL = (saturation: number, brightness: number) => (
      (updated = true), Object.assign(hsla, hsbToHsl(hsla[0], saturation, brightness))
    );
    const stop = watchEffect(() => {
      const { defaultValue } = props;
      if (updated) return stop();
      if (isArray(defaultValue)) {
        const hsb = hslToHsb(...(defaultValue as [number, number, number]));
        resetThumb(hsb[1] / 100, hsb[2] / 100);
        defaultValue[3] ??= 100;
        Object.assign(hsla, defaultValue);
        nextTick(() => stop()); // stop in next tick in case access it during initialization
      }
    });
    const getColor = (alpha?: boolean) => {
      const [h, s, l, a] = hsla;
      return `hsl(${h} ${s}% ${l}%${alpha ? `/${a}%` : ''})`;
    };
    const color = computed(() => getColor(!props.noAlpha));
    const updateValue = () => ((updated = true), (valueModel.value = color.value));

    const targetStates = useDraggableArea({
      el: paletteRef,
      disabled: () => !editComputed.editable,
      draggable: (target, { offsetX, offsetY }) => {
        const drag = target === thumb.value;
        if (!drag) {
          // click
          const { clientWidth, clientHeight } = paletteRef.value!;
          const saturation = offsetX / clientWidth,
            top = offsetY / clientHeight,
            brightness = (1 - top) * 100;
          resetThumb(saturation, top);
          targetStates.delete(thumb.value!);
          updateSL(saturation * 100, brightness);
          updateValue();
        }
        return drag;
      },
      limitInContainer: 'center',
      onMove(_, { relativeX, relativeY }) {
        Object.assign(thumbState, { relativeX, relativeY });
        const { clientWidth, clientHeight } = paletteRef.value!;
        updateSL(
          (thumbState.left + relativeX / clientWidth) * 100,
          (1 - thumbState.top - relativeY / clientHeight) * 100,
        );
      },
      onStop: updateValue,
    });

    const commonRangeProps = {
      min: 0,
      step: 1,
      noTooltip: true,
    };
    const hueRangeProps = {
      ...commonRangeProps,
      class: ns.e('hue'),
      part: compParts[3],
      railStyle,
      trackStyle,
      max: 360,
      onUpdate({ detail }: CustomEvent) {
        hsla[0] = detail;
        updateValue();
      },
    };
    const alphaRangeProps = {
      ...commonRangeProps,
      class: ns.e('alpha'),
      part: compParts[4],
      max: 100,
      trackStyle,
      onUpdate({ detail }: CustomEvent) {
        hsla[3] = detail;
        updateValue();
      },
    };

    const [stateClass] = useCEStates(() => pick(props, ['panelOnly']));

    const triggers = ['click', 'focus'];
    return () => {
      const { popoverProps, panelOnly, noAlpha } = props;
      const colorVal = color.value;
      const panelNode = (
        <div class={[ns.e('panel'), panelOnly && stateClass.value]} part={compParts[0]} slot="pop-content">
          <div class={ns.e('palette')} part={compParts[1]} ref={paletteRef}>
            <div
              class={ns.e('saturation')}
              part={compParts[6]}
              style={{
                backgroundColor: `hsl(${hsla[0]} 100% 50%)`,
                backgroundImage: saturationImage,
              }}
            ></div>
            <div class={ns.e('thumb')} part={compParts[7]} ref={thumb} style={thumbStyle.value}></div>
          </div>
          <div class={ns.e('wrapper')} part={compParts[2]}>
            <div class={ns.e('preview')} part={compParts[5]} style={{ background: colorVal }}></div>
            <div class={ns.e('ranges')} part={compParts[8]}>
              {renderElement('range', { ...hueRangeProps, value: hsla[0] })}
              {!noAlpha &&
                renderElement('range', {
                  ...alphaRangeProps,
                  value: hsla[3],
                  railStyle: {
                    background: `linear-gradient(to right,rgb(255 0 4/0),${getColor()})`,
                  },
                })}
            </div>
          </div>
        </div>
      );
      return panelOnly
        ? panelNode
        : renderElement(
            'popover',
            {
              placement: 'bottom-start',
              ...popoverProps,
              class: stateClass.value,
              showArrow: false,
              ref: popoverRef,
              triggers,
              style: ns.v({ 'picked-color': colorVal }),
            },
            <>
              <slot></slot>
              {panelNode}
            </>,
          );
    };
  },
});

export type tColorPicker = typeof ColorPicker;
export type ColorPickerExpose = {};
export type iColorPicker = InstanceType<tColorPicker> & ColorPickerExpose;

export const defineColorPicker = createDefineElement(name, ColorPicker, {}, parts, {
  select: defineSelect,
  range: defineRange,
});
