import { options } from 'data';
export default () => (
  <>
    <l-select type="normal" />
    <l-select type="normal" options={options} placeholder="type=position" />
    <l-select type="teleport" options={options} placeholder="type=teleport" />
  </>
);
