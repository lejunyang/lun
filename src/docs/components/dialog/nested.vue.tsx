import { Dialog } from '@lun/components';

const getBtn = () => (
  <>
    <l-button
      onClick={() =>
        Dialog.open({
          title: 'Title',
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
