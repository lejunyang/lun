import { getDeepestActiveElement, getTabbableElements } from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks';

const activeFocusTrapEls: HTMLElement[] = [];
const isActive = (el: HTMLElement | undefined) => el && activeFocusTrapEls[activeFocusTrapEls.length - 1] === el;

export function useFocusTrap() {
  let tabbableEls: HTMLElement[] = [],
    focusIndex = 0,
    lastActiveEl: HTMLElement | undefined,
    focusTrapEl: HTMLElement | undefined;

  const focusCurrentElement = () => {
    tabbableEls[focusIndex]?.focus({ preventScroll: true });
  };
  const focusNextElement = () => {
    focusIndex = (focusIndex + 1) % tabbableEls.length;
    focusCurrentElement();
  };
  const focusPrevElement = () => {
    focusIndex -= 1;
    if (focusIndex < 0) focusIndex = tabbableEls.length - 1;
    focusCurrentElement();
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    // need to check isActive because there can be multiple dialogs opened at the same time
    if (!isActive(focusTrapEl)) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) focusPrevElement();
      else focusNextElement();
    }
  };

  /**
   * init focus trap for the target element, return a function to perform the initial focus
   * @param target the element to trap focus
   * @param noTrap if true, the focus trap will not be activated
   * @param lastActiveElement the last active element before the focus trap was activated, if init is called after dialog opens, it must be provided
   */
  const init = (target: HTMLElement, noTrap?: boolean, lastActiveElement = getDeepestActiveElement()) => {
    focusIndex = 0;
    let autoFocusTarget: HTMLElement | undefined;
    lastActiveEl = lastActiveElement;
    [tabbableEls, autoFocusTarget] = getTabbableElements(target);

    if (!noTrap) {
      activeFocusTrapEls.push((focusTrapEl = target));
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (autoFocusTarget?.focus) {
        autoFocusTarget.focus({ preventScroll: true });
        const newActive = getDeepestActiveElement();
        focusIndex = tabbableEls.indexOf(newActive as HTMLElement);
      } else focusCurrentElement();
    };
  };

  const clear = () => {
    document.removeEventListener('keydown', handleKeyDown);
    if (isActive(focusTrapEl)) activeFocusTrapEls.pop();
  };

  const restoreFocus = () => {
    clear();
    lastActiveEl?.focus();
  };

  tryOnScopeDispose(clear);

  return [init, restoreFocus] as const;
}