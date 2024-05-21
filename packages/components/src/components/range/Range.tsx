import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { rangeEmits, rangeProps } from './type';
import { ref } from 'vue';
import { useNamespace, useValueModel } from 'hooks';
import { useSetupEdit, useSetupEvent } from '@lun/core';
import { toArrayIfNotNil } from '@lun/utils';

const name = 'range';
export const Range = defineSSRCustomElement({
  name,
  props: rangeProps,
  emits: rangeEmits,
  formAssociated: true,
  setup(props) {
    useSetupEvent();
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const rootRef = ref<HTMLElement>();
    const valueModel = useValueModel(props);

    return () => {
      const { value } = valueModel;
      return (
        <span class={ns.t} part={ns.p('part')}>
          <span class={ns.e('track')} part={ns.p('track')}></span>
          {toArrayIfNotNil(value ?? 0).map((v) => (
            <span class={ns.e('handle')} part={ns.p('handle')}></span>
          ))}
        </span>
      );
    };
  },
});

export type tRange = typeof Range;
export type iRange = InstanceType<tRange>;

export const defineRange = createDefineElement(name, Range);
