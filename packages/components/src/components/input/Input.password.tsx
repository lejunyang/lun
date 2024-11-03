import { useNamespace } from 'hooks';
import { useEdit } from '@lun-web/core';
import { renderElement } from 'utils';
import { computed, ref, watch } from 'vue';

/**
 * @returns [passwordIconRef, localType, togglePassword]
 */
export default function (type: () => any, ns: ReturnType<typeof useNamespace>) {
  const show = ref(false),
    isP = () => type() === 'password',
    localType = ref(type());
  watch(type, (val) => (localType.value = val));
  const editComputed = useEdit();
  return [
    computed(
      () =>
        isP() &&
        renderElement('icon', {
          class: ns.e('pwd-icon'),
          name: show.value ? 'eye-slash' : 'eye',
          onClick() {
            if (editComputed!.interactive) {
              localType.value = (show.value = !show.value) ? 'text' : 'password';
            }
          },
        }),
    ),
    localType,
    (force?: boolean) => {
      show.value = force ?? !show.value;
    },
  ] as const;
}
