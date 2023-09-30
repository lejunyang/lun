import { defineCustomElement } from 'custom';
import { registryAnimation, useAnimation } from '../animation';
import { GlobalStaticConfig } from 'config';
import { PropType, onMounted } from 'vue';

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
    { 'stroke-dasharray': '1px 200px', 'stroke-dashoffset': 0 },
    { offset: 0.3, 'stroke-dasharray': '100px 200px', 'stroke-dashoffset': '-15px' },
    { 'stroke-dasharray': '100px 200px', 'stroke-dashoffset': '-120px' },
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
    type: { type: String as PropType<'circle'>, default: GlobalStaticConfig.defaultProps.spin.type },
  },
  setup(props) {
    const [svgRef, svgAnimate] = useAnimation('spin.rotate');
    const [circleRef, circleAnimate] = useAnimation('spin.circle.stroke');
    onMounted(() => {
      svgAnimate();
      circleAnimate();
    });
    return () => {
      const { type } = props;
      switch (type) {
        case 'circle':
          return (
            <svg ref={svgRef} viewBox="0 0 50 50" width="1em" height="1em" fill="currentColor" part="svg">
              <circle ref={circleRef} cx="25" cy="25" r="20"></circle>
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