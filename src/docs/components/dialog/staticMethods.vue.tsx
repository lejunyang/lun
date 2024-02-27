import { Dialog } from '@lun/components';

export default () => {
  return (
    <l-button
      onClick={() => Dialog.open({
        headerTitle: 'Title',
        content: 'Content',
      })}
      label="点击打开"
    />
  );
};
