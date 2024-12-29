import { defineCustomElement } from 'custom';
import { createDefineElement, getElementFirstName, getFirstThemeProvider, toElement } from 'utils';
import { TeleportHolderProps, teleportHolderProps } from './type';
import { useContextConfig } from 'config';
import { createElement, isConnected } from '@lun-web/utils';
import { holderName } from '../config/utils';

const name = holderName;
export const TeleportHolder = defineCustomElement({
  name,
  props: teleportHolderProps,
  shadowOptions: {
    slotAssignment: 'manual',
  },
  setup() {
    const zIndex = useContextConfig('zIndex');
    return () => (
      <style>{`:host{position:fixed;inset:0;pointer-events:none;z-index:${zIndex.teleport};}:host *{pointer-events:auto}`}</style>
    );
  },
});

export type tTeleportHolder = typeof TeleportHolder;
export type TeleportHolderExpose = {};
export type iTeleportHolder = InstanceType<tTeleportHolder> & TeleportHolderExpose;

export const defineTeleportHolder = createDefineElement(name, TeleportHolder);

export function createTeleportHolderInstance({
  to,
  initialProps,
}: { to?: string | Element; initialProps?: TeleportHolderProps } = {}) {
  let target: Element | null | undefined = toElement(to);
  if (!target) target = getFirstThemeProvider();
  const teleportHolderName = getElementFirstName(name)!;
  if (__DEV__ && !teleportHolderName) throw new Error(name + ' component is not registered, please register it first.');
  const props: TeleportHolderProps = {
    ...initialProps,
  };
  const holder = createElement(teleportHolderName as any, props) as iTeleportHolder;
  (target || document.body).appendChild(holder);
  return holder;
}

let el: iTeleportHolder;
export function getTeleportHolderInstance(to?: string | HTMLElement | null) {
  if (!to) {
    return isConnected(el) ? el : (el = createTeleportHolderInstance());
  }
  return createTeleportHolderInstance({ to });
}
