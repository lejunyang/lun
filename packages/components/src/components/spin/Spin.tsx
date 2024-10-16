import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { spinProps } from './type';
import { useNamespace } from 'hooks';
import { ref, watchEffect } from 'vue';
import { getCompParts } from 'common';

const name = 'spin';
const parts = ['svg', 'circle', 'container', 'wrapper', 'mask', 'tip'] as const;
const compParts = getCompParts(name, parts);
export const Spin = defineSSRCustomElement({
  name,
  props: spinProps,
  setup(props) {
    const ns = useNamespace(name);
    const showing = ref(false);

    watchEffect((onCleanup) => {
      const { delay, spinning } = props;
      if (!spinning) showing.value = false;
      else {
        if (+delay! >= 0) {
          const id = setTimeout(() => {
            showing.value = true;
          }, +delay!);
          onCleanup(() => clearTimeout(id));
        } else showing.value = true;
      }
    });

    const getSVG = () => {
      const { type, svgStyle } = props;
      if (!showing.value) return null;
      switch (type) {
        case 'circle':
          return (
            <svg
              class={[ns.t, ns.m(type)]}
              style={svgStyle}
              viewBox="0 0 50 50"
              width="1em"
              height="1em"
              fill="none"
              part={compParts[0]}
            >
              <circle
                part={compParts[1]}
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

    return () => {
      const { asContainer, tip } = props;
      return asContainer ? (
        <div class={ns.e('container')} part={compParts[2]}>
          <slot></slot>
          {showing.value && <div class={ns.e('mask')} part={compParts[4]} />}
          <span class={ns.e('wrapper')} part={compParts[3]}>
            {getSVG()}
            <div class={ns.e('tip')} part={compParts[5]}>
              <slot name="tip">{tip}</slot>
            </div>
          </span>
        </div>
      ) : (
        getSVG()
      );
    };
  },
});

export type tSpin = typeof Spin;
export type iSpin = InstanceType<tSpin>;

export const defineSpin = createDefineElement(
  name,
  Spin,
  {
    type: 'circle',
    strokeWidth: 4,
    // FIXME can not set false because of default value??? check if it's a bug of vue
    spinning: true,
  },
  parts,
);
