import { useForm, UseFormReturn } from '@lun-web/core';
import { useEffect, useRef, useState } from 'react';
import { EffectScope, effectScope } from 'vue';

export const useReactForm = (
  params?: Parameters<typeof useForm>[0],
  options?: {
    renderOnUpdate?: boolean;
  },
) => {
  const [_, update] = useState(0);
  // @ts-ignore
  const effectRef = useRef<EffectScope>();
  if (!effectRef.current) {
    effectRef.current = effectScope();
  }
  // @ts-ignore
  const ref = useRef<UseFormReturn>();
  if (!ref.current) {
    effectRef.current.run(() => {
      const form = useForm(params);
      if (options?.renderOnUpdate) {
        form.hooks.onUpdateValue.use(() => update(Date.now()));
      }
      ref.current = form;
    });
  }

  useEffect(() => {
    return () => effectRef.current?.stop();
  }, []);

  return ref;
};
