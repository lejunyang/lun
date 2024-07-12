import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { rangeEmits, rangeProps } from './type';
import { computed, nextTick, onMounted, onUpdated, reactive, ref } from 'vue';
import { useCEStates, useNamespace, useValueModel } from 'hooks';
import { useDraggableArea, useSetupEdit, useSetupEvent } from '@lun/core';
import {
  at,
  isArray,
  isArrowDownEvent,
  isArrowLeftEvent,
  isArrowRightEvent,
  isArrowUpEvent,
  toArrayIfNotNil,
  setStyle,
  toPxIfNum,
  runIfFn,
  getRect,
} from '@lun/utils';
import { GlobalStaticConfig } from '../config/config.static';
import { getCompParts } from 'common';
import { defineTooltip, iTooltip } from '../tooltip';

const name = 'range';
const parts = ['root', 'thumb', 'rail', 'track', 'label', 'labels'] as const;
const compParts = getCompParts(name, parts);
export const Range = defineSSRCustomElement({
  name,
  props: rangeProps,
  emits: rangeEmits,
  formAssociated: true,
  setup(props) {
    useSetupEvent();
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const isEditable = () => editComputed.editable;
    const valueModel = useValueModel(props);
    const rootEl = ref<HTMLElement>(),
      labelWrapEl = ref<HTMLElement>();
    const thumbs = reactive<HTMLElement[]>([]);
    const tooltipRef = ref<iTooltip>();
    const getTooltip = (el: Element) => {
      const index = thumbs.findIndex((t) => t === el);
      if (index >= 0) {
        let value = processedValues.value[index][2];
        return runIfFn(props.tooltipFormatter, value) || value;
      }
    };
    const isVertical = () => props.type === 'vertical';

    const {
      ensureNumber,
      min,
      max,
      minus,
      divide,
      toRawNum,
      plus,
      multi,
      getPositiveInfinity,
      lessThan,
      toPrecision,
      abs,
      toNumber,
      isNaN,
      isZero,
      getPrecision,
    } = GlobalStaticConfig.math;
    type BigNum = ReturnType<typeof ensureNumber>;
    type CanBeNum = string | number | BigNum;
    const toNum = (val: BigNum) => {
      const { precision, valueType } = props;
      const res = precision == null ? toPrecision(val, getPrecision(step.value)) : toPrecision(val, precision as any);
      return valueType === 'number-text' ? String(res) : toRawNum(res);
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
          return [clamped, p, String(clamped)] as const;
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
      let /** new index of this val will be in ordered values */ newIndex: number,
        /** same as newIndex, used to track */ replacedIndex: number | undefined,
        minGap = getPositiveInfinity(),
        noIndex = index === undefined;
      const res = processedValues.value.map((value, i, arr) => {
        if (noIndex) {
          // if noIndex, will find a closest index to update
          const newGap = abs(minus(val, value[0]));
          if (lessThan(newGap, minGap)) {
            minGap = newGap;
            newIndex = i;
          }
        } else if (newIndex === undefined) {
          if (percent <= value[1]) {
            newIndex = i;
            if (i !== index) replacedIndex = i;
            return toNum(val);
          } else if (i === index) {
            if (percent > arr[i + 1]?.[1]) {
              // target is adding, and over next thumb
              newIndex = replacedIndex = i + 1;
              return toNum(arr[i + 1][0]);
            } else if (percent >= value[1]) {
              // target is adding, but not over next thumb
              newIndex = i;
              return toNum(val);
            }
          }
        }
        if (replacedIndex !== undefined) {
          const j = replacedIndex;
          replacedIndex = undefined;
          return toNum(arr[j][0]);
        }
        return toNum(value[0]);
      }) as string[] | number[];
      if (noIndex) res[newIndex!] = toNum(val);
      if (res.length === 1 && !isArray(valueModel.value)) valueModel.value = res[0];
      else valueModel.value = res;
      draggingIndex = newIndex!;
      focusThumb(newIndex!);
    };

    const getValueByCoord = (clientX: number, clientY: number) => {
      const { x, y, width, height } = getRect(rootEl.value!);
      const percent = isVertical() ? (clientY - y) / height : (clientX - x) / width;
      return multi(percent, len.value);
    };
    const updateByCoord = (clientX: number, clientY: number, index?: number) => {
      updateVal(getValueByCoord(clientX, clientY), index);
    };
    const updateTrack = (clientX: number, clientY: number) => {
      const val = clamp(getValueByCoord(clientX, clientY));
      const offset = minus(val, processedValues.value[0][0]);
      if (!isZero(offset))
        valueModel.value = processedValues.value.map(([v]) => toNum(plus(v, offset))) as string[] | number[];
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
          // a click event following dragging track, need to ignore it
          if (!draggingTrack) updateByCoord(clientX, clientY);
          else draggingTrack = false;
        }
      },
    };

    let draggingIndex: number | undefined,
      draggingTrack = false;
    useDraggableArea({
      el: rootEl,
      disabled: () => !isEditable(),
      draggable(target) {
        return (
          target.hasAttribute('data-index') ||
          (props.trackDraggable && processedValues.value.length > 1 && target.hasAttribute('data-track'))
        );
      },
      limitInContainer: (el) => ((el as HTMLElement).dataset.track ? 'target' : 'pointer'),
      get axis() {
        return isVertical() ? 'y' : 'x';
      },
      rememberRelative: false, // must clear coord remembered in last dragging for track, as we're not using transform and rerender children on every move
      onMove(target, { clientX, clientY, clientLeft, clientTop }) {
        const { dataset: { index, track } = {} } = target as HTMLElement;
        if (track) {
          draggingTrack = true;
          return updateTrack(clientLeft, clientTop);
        }
        if (index == null) return;
        draggingIndex ??= +index;
        // if draggingIndex is not undefined, must use it other than index, as index is constant during dragging, but we need to update the correct index if thumb's position has changed
        updateByCoord(clientX, clientY, draggingIndex);
      },
      onStop() {
        draggingIndex = undefined;
      },
    });

    const updateLabelSize = () => {
      if (props.labels) {
        nextTick(() => {
          const { value } = labelWrapEl;
          if (value) {
            const children = Array.from(value.children);
            setStyle(value, {
              [ns.vn('max-label-width')]: toPxIfNum(Math.max(...children.map((e) => (e as HTMLElement).offsetWidth))),
              [ns.vn('max-label-height')]: toPxIfNum(Math.max(...children.map((e) => (e as HTMLElement).offsetHeight))),
            });
          }
        });
      }
    };
    onMounted(() => {
      updateLabelSize();
      const attach = tooltipRef.value?.attachTarget;
      if (attach) thumbs.forEach((t) => attach(t));
    });
    onUpdated(updateLabelSize);

    const [stateClass] = useCEStates(() => null, ns);

    return () => {
      const { value } = processedValues,
        { type, labels, tooltipProps, railStyle, trackStyle } = props,
        { editable } = editComputed;
      return (
        <div
          class={[stateClass.value, ns.m(type)]}
          part={compParts[0]}
          style={ns.v({ min: value.length > 1 ? at(value, 0)[1] : 0, max: at(value, -1)[1] })}
          ref={rootEl}
          {...handlers}
        >
          <div class={ns.e('rail')} part={compParts[2]} style={railStyle}>
            <span class={ns.e('track')} data-track="0" part={compParts[3]} style={trackStyle}></span>
            {value.map(([_, p], index) => (
              <span
                data-index={index}
                class={ns.e('thumb')}
                part={compParts[1]}
                style={ns.v({ percent: p })}
                tabindex={editable ? 0 : undefined}
                ref={(r) => (thumbs[index] = r as HTMLElement)}
              ></span>
            ))}
          </div>
          {labels && (
            <div class={ns.e('labels')} part={compParts[5]} ref={labelWrapEl}>
              {Object.entries(labels || {}).map(([key, label]) => {
                const num = toNumber(key === 'start' ? minVal.value : key === 'end' ? maxVal.value : key);
                if (isNaN(num)) return;
                const percent = getPercent(num);
                const node = (
                  <span class={ns.e('label')} part={compParts[4]} style={ns.v({ percent })}>
                    {label}
                  </span>
                );
                return node;
              })}
            </div>
          )}
          {renderElement('tooltip', {
            content: getTooltip,
            placement: isVertical() ? 'right' : undefined,
            ...tooltipProps,
            class: ns.e('tooltip'),
            ref: tooltipRef,
          })}
        </div>
      );
    };
  },
});

export type tRange = typeof Range;
export type RangeExpose = {};
export type iRange = InstanceType<tRange> & RangeExpose;

export const defineRange = createDefineElement(name, Range, { type: 'horizontal' }, parts, {
  tooltip: defineTooltip,
});
