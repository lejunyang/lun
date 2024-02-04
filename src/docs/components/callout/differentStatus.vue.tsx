import { statuses } from '@lun/components';
import { sentence, text } from 'data';

export default () => statuses.map((s) => <l-callout message={sentence} description={text} status={s} />);
