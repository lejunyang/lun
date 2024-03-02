import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { progressProps } from './type';
import { useNamespace } from 'hooks';
import { computed } from 'vue';

const name = 'progress';
export const Progress = defineSSRCustomElement({
  name,
  props: progressProps,
  setup(props) {
    const ns = useNamespace(name);

    const getInner = () => {
      const { type, strokeColor } = props;
      switch (type) {
        case 'wave':
          return <div class={ns.e('wave')} style={{ backgroundColor: strokeColor }}></div>;
      }
    };

    const percent = computed(() => (+props.value! || 0) + '%');

    const rootStyles = computed(() => {
      const { type, strokeColor } = props;
      switch (type) {
        case 'wave':
          return {
            backgroundColor: strokeColor,
            ...ns.v({
              value: percent.value,
            }),
          };
      }
    });

    return () => {
      const { noPercent } = props;
      return (
        <div class={ns.t} part="root" style={rootStyles.value}>
          <span class={ns.e('text')} part="text">
            <slot>{!noPercent && percent.value}</slot>
          </span>
          {getInner()}
        </div>
      );
    };
  },
});

export type tProgress = typeof Progress;

export const defineProgress = createDefineElement(name, Progress);
