import { options } from 'data';

export default () => (
  <>
    <l-radio-group options={options} type="button" size="2" />
    <l-radio-group type="button" class="w-full">
      <l-radio value="1">option1</l-radio>
      <l-radio value="2" end>option2</l-radio>
      分割
      <l-radio value="3" start>option3</l-radio>
      <l-radio value="4">option4</l-radio>
    </l-radio-group>
  </>
);
