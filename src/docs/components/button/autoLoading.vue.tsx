import { delay } from '@lun-web/utils';

export default function () {
  return <l-button asyncHandler={() => delay(3000)}>异步处理 3s</l-button>;
}
