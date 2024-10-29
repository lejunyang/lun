import { renderElement } from 'utils';
import {
  HTMLAttributes,
  inject,
  onBeforeUnmount,
  provide,
  Ref,
  ref,
  ShallowRef,
  shallowRef,
  VNodeChild,
  watch,
} from 'vue';
import { iTooltip, TooltipProps } from '../components/tooltip';
import { iPopover } from '../components/popover';

type TooltipProvideWeakMap = WeakMap<HTMLElement, () => VNodeChild>;
type TooltipProvide = [Ref<iTooltip>, TooltipProvideWeakMap, ShallowRef<HTMLElement | undefined>];

export function useTooltipManage() {
  const key = Symbol(__DEV__ ? 'use-tooltip-provide' : '');

  return [
    function useTooltipProvide(tooltipProps?: TooltipProps & HTMLAttributes) {
      const map: TooltipProvideWeakMap = new WeakMap(),
        r = ref() as Ref<iTooltip>,
        active = shallowRef<HTMLElement>();
      provide<TooltipProvide>(key, [r, map, active]);
      const content = (el: HTMLElement) => {
        active.value = el;
        return map.get(el)?.();
      };
      return () =>
        renderElement('tooltip', {
          freezeWhenClosing: true,
          ...tooltipProps,
          ref: r,
          content,
        });
    },
    function useTooltipInject(render: () => VNodeChild, options?: Parameters<iPopover['attachTarget']>[1]) {
      const targetRef = ref<HTMLElement>();
      const i = inject<TooltipProvide>(key);
      if (!i) return [];
      const [tooltip, map, active] = i;
      const update = (el = targetRef.value, isSet?: number) => {
        tooltip.value?.popover[isSet ? 'attachTarget' : 'detachTarget'](el, options);
        map[isSet ? 'set' : 'delete'](el!, render);
      };
      onBeforeUnmount(() => update());
      watch(targetRef, (el, oldEl) => {
        if (el) update(el, 1);
        if (oldEl) update(oldEl);
      });
      return [targetRef, active] as const;
    },
  ] as const;
}
