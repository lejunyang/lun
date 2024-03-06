import { options } from 'data';
export default () => (
  <>
    <l-select type="fixed" />
    <l-select type="fixed" options={options} placeholder="type=fixed" />
    <l-select type="teleport" options={options} placeholder="type=teleport" />
  </>
);
