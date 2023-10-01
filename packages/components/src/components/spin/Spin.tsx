import { defineCustomElement } from 'custom';
import { registryAnimation, useAnimation } from '../animation';
import { GlobalStaticConfig } from 'config';
import { PropType, onMounted } from 'vue';
import { Responsive, useComputedBreakpoints } from '@lun/core';
import { setDefaultsForPropOptions } from 'utils';

registryAnimation('spin.rotate', {
  keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(1turn)' }],
  options: {
    duration: 1400,
    easing: 'linear',
    iterations: Infinity,
  },
});

registryAnimation('spin.circle.stroke', {
  keyframes: [
    { strokeDasharray: '1px 200px', strokeDashoffset: 0 },
    { offset: 0.3, strokeDasharray: '100px 200px', strokeDashoffset: '-15px' },
    { strokeDasharray: '100px 200px', strokeDashoffset: '-120px' },
  ],
  options: {
    duration: 1400,
    easing: 'ease-in-out',
    iterations: Infinity,
  },
});

export const Spin = defineCustomElement({
  name: GlobalStaticConfig.nameMap.spin,
  props: {
    ...setDefaultsForPropOptions(
      {
        type: { type: String as PropType<'circle'> },
        strokeWidth: { type: [Number, String] },
        size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>> },
      },
      GlobalStaticConfig.defaultProps.spin
    ),
  },
  styles: GlobalStaticConfig.styles.spin,
  setup(props) {
    const [svgRef, svgAnimate] = useAnimation('spin.rotate');
    const [circleRef, circleAnimate] = useAnimation('spin.circle.stroke');
    const spinSizeClass = useComputedBreakpoints(() => props.size, 'l-spin-size');

    onMounted(() => {
      svgAnimate();
      circleAnimate();
    });
    return () => {
      const { type } = props;
      switch (type) {
        case 'circle':
          return (
            <svg
              class={spinSizeClass.value}
              ref={svgRef}
              viewBox="0 0 50 50"
              width="1em"
              height="1em"
              fill="none"
              part="svg"
            >
              <circle
                part="circle"
                ref={circleRef}
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

declare module 'vue' {
  export interface GlobalComponents {
    LSpin: typeof Spin;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-spin': typeof Spin;
  }
}

export function defineSpin(name?: string) {
  name ||= GlobalStaticConfig.nameMap.spin;
  if (!customElements.get(name)) {
    GlobalStaticConfig.actualNameMap['spin'].add(name);
    customElements.define(name, Spin);
  }
}
