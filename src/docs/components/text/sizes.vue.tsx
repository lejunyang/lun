import { arrayFrom } from '@lun/utils';
import { sentence } from 'data';

export default () => arrayFrom(9, (_, i) => <l-text text={sentence} size={i + 1} class="w-full"></l-text>);
