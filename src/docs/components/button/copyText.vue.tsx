import { Message } from '@lun-web/components';

const notify = () => Message.success('Copy success');
export default () => (
  <>
    <l-button copyText={() => String(new Date())} onCopySuccess={notify}>
      copy current Date
    </l-button>
    <l-button copyText="text" onCopySuccess={notify}>
      copy string
    </l-button>
  </>
);
