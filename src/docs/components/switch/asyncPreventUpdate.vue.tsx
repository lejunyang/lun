import { Message } from '@lun-web/components';
import { delay } from '@lun-web/utils';

export default () => (
  <l-switch
    beforeUpdate={async () => {
      Message.info({
        message: 'Loading...',
        duration: 2000,
      });
      await delay(2000);
      const update = Math.random() > 0.5;
      Message.info(`Decides to ${update ? '' : 'not'} update`);
      return update;
    }}
  />
);
