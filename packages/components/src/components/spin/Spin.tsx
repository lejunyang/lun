import { registryAnimation } from '../animation';

registryAnimation('spin.rotate', {
  keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(1turn)' }],
  options: {
    duration: '1.4s',
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
    duration: '1.4s',
    easing: 'ease-in-out',
    iterations: Infinity,
  },
});
