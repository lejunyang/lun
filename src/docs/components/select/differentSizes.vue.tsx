import { arrayFrom } from '@lun-web/utils';
import { groupOptions } from 'data';
export default () => {
  return arrayFrom(3, (_, i) => <l-select size={i + 1} placeholder={`Size ${i + 1}`} options={groupOptions} />);
};
