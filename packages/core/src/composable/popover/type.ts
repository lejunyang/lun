import { VirtualElement } from '../../hooks';
import { MaybeRefLikeOrGetter } from '../../utils';

export type PopoverTrigger = 'hover' | 'focus' | 'edit' | 'click' | 'contextmenu' | 'select' | 'pointerdown';

export interface PopoverAttachTargetOptions {
  slotName?: string;
  isDisabled?: MaybeRefLikeOrGetter<boolean>;
}

export type UsePopoverOptions = {
  /** manually control the open state of popover */
  open?: boolean;
  disabled?: MaybeRefLikeOrGetter<boolean>;
  onOpen: () => void | boolean;
  beforeOpen?: () => void | boolean;
  target: MaybeRefLikeOrGetter<Element | VirtualElement>;
  pop: MaybeRefLikeOrGetter<Element>;
  triggers?: PopoverTrigger | PopoverTrigger[];
  openDelay?: number | string;
  closeDelay?: number | string;
  toggleMode?: boolean;
  targetFocusThreshold?: number;
  preventSwitchWhen?: 'focus' | 'edit';
  pointerTarget?: 'rect' | 'coord';
  onPopContentClose?: (e: Event) => void;
};

export type UsePopoverInnerOptions = Readonly<{
  targetFocusThreshold: number;
  readonly manual: boolean;
  triggers: Set<PopoverTrigger>;
  cancelOpenOrClose: () => void;
  open(): void;
  close(ensure?: boolean): void;
  openNow(): void;
  closeNow(): void;
  toggleNow(force?: boolean): void;
}>;
