import { delay } from '@lun/utils';

export default function () {
  return (
    <>
      <l-button hold="1500" onValidClick={() => alert('OK')}>
        按住 1.5s 确认
      </l-button>
      <l-button
        hold="1000"
        asyncHandler={async () => {
          await delay(3000);
          alert('OK');
        }}
      >
        1s 确认,3s 加载
      </l-button>
    </>
  );
}
