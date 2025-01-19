import { defineCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { progressProps } from './type';
import { useNamespace } from 'hooks';
import { computed } from 'vue';
import { ElementWithExpose, getCompParts, renderStatusIcon } from 'common';
import { defineIcon } from '../icon/Icon';
import { toPxIfNum } from '@lun-web/utils';
import { methods } from './progress.static-methods';

const name = 'progress';
const parts = ['root', 'text', 'stroke'] as const;
const compParts = getCompParts(name, parts);
export const Progress = Object.assign(
  defineCustomElement({
    name,
    props: progressProps,
    setup(props, { emit }) {
      const ns = useNamespace(name);
      const isPageTop = () => props.type === 'page-top',
        isLine = () => isPageTop() || props.type === 'line',
        isWave = () => props.type === 'wave';

      const transitionEnd = () => {
        if (numValue.value === 100) emit('done');
      };

      const getStroke = () => {
        const { type, strokeColor, strokeStyle } = props;
        if (isWave() || isLine()) {
          if (isWave() && !numValue.value) return;
          return (
            <div
              class={ns.e(type)}
              part={compParts[2]}
              onTransitionend={transitionEnd}
              style={{
                backgroundColor: strokeColor,
                ...strokeStyle,
              }}
            ></div>
          );
        }
      };

      const numValue = computed(() => +props.value! || 0);
      const percent = computed(() => numValue.value + '%');

      const rootStyles = computed(() => {
        let { trailerColor, width, height, trailerStyle } = props;
        width = toPxIfNum(width);
        height = toPxIfNum(height);
        if (isWave() || isLine()) {
          return {
            backgroundColor: trailerColor,
            ...trailerStyle,
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
          <span class={[ns.em('text', type), ns.e('text')]} part={compParts[1]}>
            <slot>
              {(showStatusIcon &&
                renderStatusIcon(status, {
                  noCircle: isWave(),
                })) ||
                (!noPercent && !isPageTop() && percent.value)}
            </slot>
          </span>
        );
        const line = isLine();
        return (
          <>
            <div class={[ns.t, ns.m(type)]} part={compParts[0]} style={rootStyles.value}>
              {getStroke()}
              {!line && text}
            </div>
            {line && text}
          </>
        );
      };
    },
  }),
  methods,
);

export type ProgressExpose = {};
export type tProgress = ElementWithExpose<typeof Progress, ProgressExpose>;
export type iProgress = InstanceType<typeof Progress>;

export const defineProgress = createDefineElement(name, Progress, { type: 'wave' }, parts, [defineIcon]);
