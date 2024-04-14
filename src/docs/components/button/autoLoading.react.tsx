import { delay } from '@lun/utils';
import { LButton } from '@lun/react';

export default function () {
  return <LButton asyncHandler={() => delay(3000)} onValidClick={e => console.log('vvv', e)}>异步处理 3s</LButton>;
}
