import { statuses } from '@lun-web/components';
import { sentence, text } from 'data';

export default () => statuses.map((s) => <l-callout message={sentence} description={text} status={s} closable />);
