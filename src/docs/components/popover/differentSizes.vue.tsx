import { arrayFrom } from '@lun/utils';

export default function () {
  return arrayFrom(4, (_, i) => (
    <l-popover size={i + 1} content={`Size ${i + 1}`}>
      <l-button>Size {i + 1}</l-button>
    </l-popover>
  ));
}
