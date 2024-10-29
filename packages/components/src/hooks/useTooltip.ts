import { renderElement } from 'utils';
import { HTMLAttributes, inject, onBeforeUnmount, provide, Ref, ref, VNodeChild, watch } from 'vue';
import { iTooltip, TooltipProps } from '../components/tooltip';
import { iPopover } from '../components/popover';

type TooltipProvide = [Ref<iTooltip>, WeakMap<HTMLElement, () => VNodeChild>];

export function useTooltipManage() {
  const key = Symbol(__DEV__ ? 'use-tooltip-provide' : '');

  return [
    function useTooltipProvide(tooltipProps?: TooltipProps & HTMLAttributes) {
      const map = new WeakMap(),
        r = ref() as Ref<iTooltip>;
      provide<TooltipProvide>(key, [r, map]);
      const content = (el: HTMLElement) => map.get(el)?.();
      return () =>
        renderElement('tooltip', {
          ...tooltipProps,
          ref: r,
          content,
        });
    },
    function useTooltipInject(render: () => VNodeChild, options?: Parameters<iPopover['attachTarget']>[1]) {
      const targetRef = ref<HTMLElement>();
      const i = inject<TooltipProvide>(key);
      if (!i) return;
      const [tooltip, map] = i;
      const update = (el = targetRef.value, isSet?: number) => {
        tooltip.value?.popover[isSet ? 'attachTarget' : 'detachTarget'](el, options);
        map[isSet ? 'set' : 'delete'](el!, render);
      };
      onBeforeUnmount(() => update());
      watch(targetRef, (el, oldEl) => {
        if (el) update(el, 1);
        if (oldEl) update(oldEl);
      });
      return targetRef;
    },
  ] as const;
}
