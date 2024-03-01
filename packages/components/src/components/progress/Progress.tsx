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
      const { type } = props;
      switch (type) {
        case 'wave':
          return <div class={ns.e('wave')}></div>;
      }
    };

    const percent = computed(() => (+props.value! || 0) + '%');

    const rootStyles = computed(() => {
      const { type } = props;
      switch (type) {
        case 'wave':
          return ns.v({
            value: percent.value,
          });
      }
    });

    return () => {
      return (
        <div class={ns.t} part="root" style={rootStyles.value}>
          <slot>{percent.value}</slot>
          {getInner()}
        </div>
      );
    };
  },
});

export type tProgress = typeof Progress;

export const defineProgress = createDefineElement(name, Progress);
