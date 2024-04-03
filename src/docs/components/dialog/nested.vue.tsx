import { Dialog } from '@lun/components';

const getBtn = () => (
  <l-button onClick={() => Dialog.open({ title: 'Title', content: getBtn(), destroyOnClose: false })}>open</l-button>
);

export default getBtn;
