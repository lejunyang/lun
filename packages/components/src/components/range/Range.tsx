import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { rangeEmits, rangeProps } from './type';
import { computed, nextTick, reactive, ref } from 'vue';
import { useCEStates, useNamespace, useValueModel } from 'hooks';
import { useDraggableMonitor, useSetupEdit, useSetupEvent } from '@lun/core';
import {
  at,
  isArray,
  isArrowDownEvent,
  isArrowLeftEvent,
  isArrowRightEvent,
  isArrowUpEvent,
  toArrayIfNotNil,
  clamp as clampNum,
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
    const isEditable = () => editComputed.value.editable;
    const valueModel = useValueModel(props);
    const rootEl = ref<HTMLElement>();
    const thumbs = reactive<HTMLElement[]>([]);

    const { ensureNumber, min, max, minus, divide, toRawNum, plus, multi, getPositiveInfinity, lessThan, toPrecision } =
      GlobalStaticConfig.math;
    type BigNum = ReturnType<typeof ensureNumber>;
    type CanBeNum = string | number;
    const toNum = (val: BigNum) => {
      const { precision } = props;
      return toRawNum(precision == null ? val : toPrecision(val, precision as any));
    };

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

    const focusThumb = (index: number) => {
      nextTick(() => {
        thumbs[index]?.focus();
      });
    };

    const updateVal = (val: BigNum, index?: number) => {
      const percent = getPercent(val);
      let currentIndex: number,
        /** new index of this val will be in ordered values */ newIndex: number,
        minGap = getPositiveInfinity(),
        noIndex = index === undefined;
      const res = processedValues.value.map((value, i, arr) => {
        const v = currentIndex !== undefined ? arr[currentIndex++] : value;
        if (noIndex) {
          // if noIndex, will find a closest index to update
          const newGap = minus(val, v[0]);
          if (lessThan(newGap, minGap)) {
            minGap = newGap;
            newIndex = i;
          }
        } else if (newIndex === undefined && (percent < v[1] || i === arr.length - 1)) {
          currentIndex = newIndex = i;
          return toNum(val);
        }
        return i === index ? toNum(arr[currentIndex++][0]) : toNum(v[0]);
      });
      if (noIndex) res[newIndex!] = toNum(val);
      if (res.length === 1 && !isArray(valueModel.value)) valueModel.value = res[0];
      else valueModel.value = res;
      focusThumb(newIndex!);
    };

    const getRootRect = () => rootEl.value!.getBoundingClientRect();
    const updateByCoord = (clientX: number, clientY: number, index?: number) => {
      const { x, y, width, height } = getRootRect();
      const percent = props.type === 'vertical' ? (clientY - y) / height : (clientX - x) / width;
      updateVal(multi(percent, len.value), index);
    };
    const handlers = {
      onKeydown(e: KeyboardEvent) {
        const { target } = e;
        const {
          dataset: { index },
        } = target as HTMLElement;
        if (index == null || !isEditable()) return;
        const value = processedValues.value[+index][0];
        if (isArrowLeftEvent(e) || isArrowDownEvent(e)) {
          updateVal(max(minus(value, step.value), minVal.value), +index);
        } else if (isArrowRightEvent(e) || isArrowUpEvent(e)) {
          updateVal(min(plus(value, step.value), maxVal.value), +index);
        }
      },
      onClick(e: MouseEvent) {
        const { target, clientX, clientY } = e;
        const {
          dataset: { index },
        } = target as HTMLElement;
        if (!isEditable()) return;
        if (index != null) {
          // it's thumb element
          focusThumb(+index);
        } else {
          updateByCoord(clientX, clientY);
        }
      },
    };

    useDraggableMonitor({
      el: rootEl,
      disabled: () => !isEditable(),
      draggable(target) {
        return target.hasAttribute('data-index');
      },
      getCoord({ clientX, clientY }) {
        const { x, y, width, height } = getRootRect();
        return [clampNum(clientX, x, x + width), clampNum(clientY, y, y + height)];
      },
      onMove(target, { clientX, clientY }) {
        const { dataset: { index } = {} } = target as HTMLElement;
        if (index == null) return;
        updateByCoord(clientX, clientY, +index);
      },
    });

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
          ref={rootEl}
          {...handlers}
        >
          <span class={ns.e('track')} part={ns.p('track')}></span>
          {value.map(([_, p], index) => (
            <span
              data-index={index}
              class={ns.e('thumb')}
              part={ns.p('thumb')}
              style={ns.v({ percent: p })}
              tabindex={editable ? 0 : undefined}
              ref={(r) => (thumbs[index] = r as HTMLElement)}
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
