import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { spinProps } from './type';
import { useNamespace } from 'hooks';
import { ref, watchEffect } from 'vue';
import { useInstanceStyle } from '@lun/core';
import { getValuesFromStyle } from '@lun/utils';

const name = 'spin';
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

    const ceStyle = useInstanceStyle((style) => getValuesFromStyle(style, 'font-size', 'color'));

    const getSVG = () => {
      const { type } = props;
      if (!showing.value) return null;
      switch (type) {
        case 'circle':
          return (
            <svg
              class={[ns.t, ns.m(type)]}
              style={ceStyle.value}
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

    return () => {
      const { asContainer, tip } = props;
      return asContainer ? (
        <div class={ns.e('container')} part="container">
          <slot></slot>
          {showing.value && <div class={ns.e('mask')} part="mask" />}
          <span class={ns.e('wrapper')} part="wrapper">
            {getSVG()}
            <div class={ns.e('tip')} part="tip">
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

export const defineSpin = createDefineElement(name, Spin);
