import { useNamespace } from 'hooks';
import { InputType, useSetupEdit } from '@lun/core';
import { renderElement } from 'utils';
import { computed, ref, watch } from 'vue';

/**
 * @returns [passwordIconRef, localType, isPasswordShow]
 */
export default function (
  type: () => InputType | undefined,
  edit: ReturnType<typeof useSetupEdit>[0],
  ns: ReturnType<typeof useNamespace>,
) {
  const show = ref(false),
    isP = () => type() === 'password',
    localType = ref(type());
  watch(type, (val) => (localType.value = val));
  return [
    computed(
      () =>
        isP() &&
        renderElement('icon', {
          class: ns.e('pwd-icon'),
          name: show.value ? 'eye-slash' : 'eye',
          onClick() {
            if (edit.value.interactive) {
              localType.value = (show.value = !show.value) ? 'text' : 'password';
            }
          },
        }),
    ),
    localType,
    show,
  ] as const;
}
