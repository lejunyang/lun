import { sentence } from 'data';

export default () => (
  <>
    <l-text text={sentence} color="tomato" class="w-full"></l-text>
    <l-text text={sentence} color="tomato" highContrast class="w-full"></l-text>
    <l-text text={sentence} color="tomato" grayColor="sage" class="w-full"></l-text>
    <l-text text={sentence} color="iris" class="w-full"></l-text>
  </>
);
