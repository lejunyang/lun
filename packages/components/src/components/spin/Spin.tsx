import { defineSSRCustomElement } from 'custom';
import { registryAnimation, useAnimation } from '../animation';
import { onMounted } from 'vue';
import { useComputedBreakpoints } from '@lun/core';
import { createDefineElement, createImportStyle } from 'utils';
import { spinProps } from './type';
import styles from './basic.scss?inline';

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

const name = 'spin';
export const Spin = defineSSRCustomElement({
  name,
  props: spinProps,
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

export type tSpin = typeof Spin;

export const defineSpin = createDefineElement(name, Spin);
export const importSpinStyle = createImportStyle(name, styles);
