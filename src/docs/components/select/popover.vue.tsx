import { options } from 'data';
export default () => (
  <>
    <l-select type="position" />
    <l-select type="position" options={options} placeholder="type=position" />
    <l-select type="teleport" options={options} placeholder="type=teleport" />
  </>
);
