import { Dialog } from '@lun-web/components';

const getBtn = () => (
  <>
    <l-button
      onClick={() =>
        Dialog.open({
          header: 'Title',
          content: getBtn(),
        })
      }
    >
      open
    </l-button>
    <l-button onClick={Dialog.destroyAll}>destroyAll</l-button>
  </>
);

export default getBtn;
