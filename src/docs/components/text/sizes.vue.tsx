import { sentence } from 'data';

export default () =>
  Array(9)
    .fill(1)
    .map((_, i) => <l-text text={sentence} size={i + 1} class="w-full"></l-text>);
