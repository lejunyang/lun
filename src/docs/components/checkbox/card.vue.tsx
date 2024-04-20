import { options } from 'data';

export default () => (
  <>
    <l-checkbox-group type="card" options={[{ checkForAll: true, label: '全选' }, ...options]}></l-checkbox-group>
  </>
);
