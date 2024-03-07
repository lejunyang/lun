import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { progressProps } from './type';
import { useNamespace } from 'hooks';
import { computed } from 'vue';
import { renderStatusIcon } from 'common';
import { defineIcon } from '../icon/Icon';
import { toPxIfNum } from '@lun/utils';

const name = 'progress';
export const Progress = defineSSRCustomElement({
  name,
  props: progressProps,
  setup(props) {
    const ns = useNamespace(name);

    const getInner = () => {
      const { type, strokeColor } = props;
      if (type === 'wave' || type === 'line') {
        if (type === 'wave' && !numValue.value) return;
        return (
          <div
            class={ns.e(type)}
            style={{
              backgroundColor: strokeColor,
            }}
          ></div>
        );
      }
    };

    const numValue = computed(() => +props.value! || 0);
    const percent = computed(() => numValue.value + '%');

    const rootStyles = computed(() => {
      let { type, trailerColor, width, height } = props;
      width = toPxIfNum(width);
      height = toPxIfNum(height);
      if (type === 'wave' || type === 'line') {
        return {
          backgroundColor: trailerColor,
          ...ns.v({
            value: percent.value,
            'num-value': numValue.value / 100,
            width,
            height,
          }),
        };
      }
    });

    return () => {
      const { noPercent, status, showStatusIcon, type } = props;
      const text = (
        <span class={[ns.em('text', type), ns.e('text')]} part="text">
          <slot>
            {(showStatusIcon &&
              renderStatusIcon(status, {
                noCircle: type === 'wave',
              })) ||
              (!noPercent && percent.value)}
          </slot>
        </span>
      );
      const isLine = type === 'line';
      return (
        <>
          <div class={[ns.t, ns.m(type)]} part="root" style={rootStyles.value}>
            {getInner()}
            {!isLine && text}
          </div>
          {isLine && text}
        </>
      );
    };
  },
});

export type tProgress = typeof Progress;

export const defineProgress = createDefineElement(name, Progress, {
  icon: defineIcon,
});
