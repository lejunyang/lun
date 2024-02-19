import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { spinProps } from './type';
import { useNamespace } from 'hooks';

const name = 'spin';
export const Spin = defineSSRCustomElement({
  name,
  props: spinProps,
  setup(props) {
    const ns = useNamespace(name);

    return () => {
      const { type } = props;
      switch (type) {
        case 'circle':
          return (
            <svg
              class={[ns.t, ns.m(type)]}
              viewBox="0 0 50 50"
              width="1em"
              height="1em"
              fill="none"
              part="svg"
            >
              <circle
                part="circle"
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                stroke-dashoffset={0}
                stroke-dasharray="80px 200px"
                stroke-width={props.strokeWidth}
              ></circle>
            </svg>
          );
      }
    };
  },
});

export type tSpin = typeof Spin;

export const defineSpin = createDefineElement(name, Spin);
