import { options } from 'data';

export default () => (
  <>
    <l-checkbox-group
      vertical
      onUpdate={(e) => console.log('check', e.detail)}
      options={[{ checkForAll: true, label: '全选' }, ...options]}
    />
  </>
);
