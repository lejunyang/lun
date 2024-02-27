import { Message } from '@lun/components';

export default () => {
  return (
    <l-button
      onClick={() =>
        Message.open({
          description: 'Description',
        })
      }
      label="点击展示"
    />
  );
};
