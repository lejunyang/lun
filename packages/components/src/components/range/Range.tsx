import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { rangeEmits, rangeProps } from './type';
import { computed } from 'vue';
import { useCEStates, useNamespace, useValueModel } from 'hooks';
import { useSetupEdit, useSetupEvent } from '@lun/core';
import {
  at,
  isArray,
  isArrowDownEvent,
  isArrowLeftEvent,
  isArrowRightEvent,
  isArrowUpEvent,
  toArrayIfNotNil,
} from '@lun/utils';
import { GlobalStaticConfig } from '../config/config.static';

const name = 'range';
export const Range = defineSSRCustomElement({
  name,
  props: rangeProps,
  emits: rangeEmits,
  formAssociated: true,
  setup(props) {
    useSetupEvent();
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const valueModel = useValueModel(props);

    const { ensureNumber, min, max, minus, divide, toRawNum, plus } = GlobalStaticConfig.math;
    type BigNum = ReturnType<typeof ensureNumber>;
    type CanBeNum = string | number;
    const minVal = computed(() => ensureNumber(props.min, 0));
    const maxVal = computed(() => ensureNumber(props.max, 100));
    const len = computed(() => minus(maxVal.value, minVal.value));
    const step = computed(() => ensureNumber(props.step, 1));
    const clamp = (val: CanBeNum) => {
      const vmin = minVal.value,
        vmax = maxVal.value;
      return min(max(ensureNumber(val, 0), vmin), vmax);
    };
    const getPercent = (val: BigNum) => {
      return toRawNum(divide(minus(val, minVal.value), len.value));
    };

    const processedValues = computed(() => {
      const { value } = valueModel;
      return toArrayIfNotNil(value ?? 0)
        .map((v) => {
          const clamped = clamp(v),
            p = getPercent(clamped);
          return [clamped, p] as const;
        })
        .sort((a, b) => a[1] - b[1]);
    });

    const updateVal = (index: number, val: BigNum) => {
      const res = processedValues.value.map((v, i) => {
        return i === index ? toRawNum(val) : toRawNum(v[0]);
      });
      if (res.length === 1 && !isArray(valueModel.value)) valueModel.value = res[0];
      else valueModel.value = res;
    };

    const handlers = {
      onKeydown(e: KeyboardEvent) {
        const { target } = e;
        const {
          dataset: { index },
        } = target as HTMLElement;
        if (index == null || !editComputed.value.editable) return;
        const value = processedValues.value[+index][0];
        if (isArrowLeftEvent(e) || isArrowDownEvent(e)) {
          updateVal(+index, max(minus(value, step.value), minVal.value));
        } else if (isArrowRightEvent(e) || isArrowUpEvent(e)) {
          updateVal(+index, min(plus(value, step.value), maxVal.value));
        }
      },
    };

    const [stateClass] = useCEStates(() => null, ns, editComputed);

    return () => {
      const { value } = processedValues,
        { type } = props,
        { editable } = editComputed.value;
      return (
        <div
          class={[stateClass.value, ns.m(type)]}
          part={ns.p('root')}
          style={ns.v({ min: value.length > 1 ? at(value, 0)[1] : 0, max: at(value, -1)[1] })}
          {...handlers}
        >
          <span class={ns.e('track')} part={ns.p('track')}></span>
          {value.map(([_, p], index) => (
            <span
              data-index={index}
              class={ns.e('handle')}
              part={ns.p('handle')}
              style={ns.v({ percent: p })}
              tabindex={editable ? 0 : undefined}
            ></span>
          ))}
        </div>
      );
    };
  },
});

export type tRange = typeof Range;
export type iRange = InstanceType<tRange>;

export const defineRange = createDefineElement(name, Range);
