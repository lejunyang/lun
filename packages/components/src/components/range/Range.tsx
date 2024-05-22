import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { rangeEmits, rangeProps } from './type';
import { computed } from 'vue';
import { useNamespace, useValueModel } from 'hooks';
import { useSetupEdit, useSetupEvent } from '@lun/core';
import { at, toArrayIfNotNil } from '@lun/utils';
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

    const { ensureNumber, min, max, minus, divide, toRawNum } = GlobalStaticConfig.math;
    const minVal = computed(() => ensureNumber(props.min, 0));
    const maxVal = computed(() => ensureNumber(props.min, 100));
    const getPercent = (val: string | number) => {
      const vmin = minVal.value,
        vmax = maxVal.value;
      const v = min(max(ensureNumber(val, 0), vmin), vmax);
      return toRawNum(divide(minus(v, vmin), minus(vmax, vmin)));
    };
    const percents = computed(() => {
      const { value } = valueModel;
      return toArrayIfNotNil(value ?? 0)
        .map(getPercent)
        .sort((a, b) => a - b);
    });

    return () => {
      const { value } = percents;
      return (
        <span class={ns.t} part={ns.p('part')} style={ns.v({ min: at(value, 0), max: at(value, -1) })}>
          <span class={ns.e('track')} part={ns.p('track')}></span>
          {value.map((v) => (
            <span class={ns.e('handle')} part={ns.p('handle')} style={ns.v({ percent: v })}></span>
          ))}
        </span>
      );
    };
  },
});

export type tRange = typeof Range;
export type iRange = InstanceType<tRange>;

export const defineRange = createDefineElement(name, Range);
