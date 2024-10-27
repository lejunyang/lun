import { delay } from '@lun-web/utils';
import { LButton } from '@lun-web/react';

export default function () {
  return <LButton asyncHandler={() => delay(3000)} onValidClick={e => console.log('vvv', e)}>异步处理 3s</LButton>;
}
