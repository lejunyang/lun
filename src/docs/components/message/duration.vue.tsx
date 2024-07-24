import { Message } from '@lun/components';

export default () => {
  return (
    <>
      <l-button
        onClick={() =>
          Message.open({
            description: 'Description',
            duration: 3000,
          })
        }
        label="3s"
      />
      <l-button
        onClick={() =>
          Message.open({
            description: 'Description',
            duration: null,
            closable: true,
          })
        }
        label="不自动关闭"
      />
    </>
  );
};
