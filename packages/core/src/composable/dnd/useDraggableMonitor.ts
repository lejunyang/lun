import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { reactive, watchEffect } from 'vue';
import { AnyFn, on, prevent, rafThrottle, runIfFn } from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks';
import { useInlineStyleManager } from '../dialog/useInlineStyleManager';

export type DraggableElementState = {
  relativeX: number;
  relativeY: number;
  dx: number;
  dy: number;
  dragging: boolean;
  clientX: number;
  clientY: number;
};

export type DraggableFn = (
  target: Element,
  e: PointerEvent,
  state?: DraggableElementState,
) => boolean | undefined | null;

export function useDraggableMonitor({
  el,
  asWhole,
  draggable,
  getCoord,
  disabled,
  animationFrames,
  onMove,
  onStop,
  onClean,
  ignoreWhenAlt,
}: {
  el: MaybeRefLikeOrGetter<Element>;
  /** if asWhole is true, all draggable children elements consider as whole, sharing same state; otherwise, each child element has its own state */
  asWhole?: boolean;
  draggable: DraggableFn;
  getCoord?: (e: PointerEvent) => [number, number];
  disabled?: MaybeRefLikeOrGetter<boolean>;
  animationFrames?: number;
  onMove?: (target: Element, state: DraggableElementState) => void;
  onStop?: (target: Element, state: DraggableElementState) => void;
  onClean?: () => void;
  ignoreWhenAlt?: boolean;
}) {
  const targetStates = reactive(new WeakMap<Element, DraggableElementState>());
  let draggingCount = 0;
  const [storeAndSetStyle, restoreElStyle] = useInlineStyleManager();

  const finalGetCoord = (e: PointerEvent) => getCoord?.(e) || [e.clientX, e.clientY];

  const handleStart = (e: PointerEvent) => {
    const { button, target, pointerId, altKey } = e;
    if (button !== 0 || (ignoreWhenAlt && altKey)) return; // left button only
    const targetEl = target as Element,
      keyEl = asWhole ? unrefOrGet(el)! : targetEl;
    const state = targetStates.get(keyEl);
    if (!draggable(targetEl, e, state)) return;
    const [clientX, clientY] = finalGetCoord(e);
    if (!state) {
      targetStates.set(keyEl, {
        relativeX: 0,
        relativeY: 0,
        dx: -clientX,
        dy: -clientY,
        dragging: true,
        clientX,
        clientY,
      });
    } else {
      Object.assign(state, {
        dx: state.relativeX - clientX,
        dy: state.relativeY - clientY,
        relativeX: clientX,
        relativeY: clientY,
        dragging: true,
        clientX,
        clientY,
      });
    }
    draggingCount += 1;
    targetEl.setPointerCapture(pointerId); // found that pointer capture will invalidate cursor:move... seems cannot be fixed unless we don't use it
    storeAndSetStyle(targetEl as HTMLElement, { userSelect: 'none' });
  };

  const handleEnd = ({ target }: PointerEvent) => {
    const targetEl = target as Element;
    const state = targetStates.get(asWhole ? unrefOrGet(el)! : targetEl);
    if (!draggingCount || !state?.dragging) return;
    draggingCount -= 1;
    restoreElStyle(targetEl);
    state.dragging = false;
    runIfFn(onStop, targetEl, state);
  };

  const emitMove = rafThrottle((el: Element, state: DraggableElementState) => {
    runIfFn(onMove, el, state);
  }, animationFrames);

  const handleMove = (e: PointerEvent) => {
    const targetEl = e.target as Element,
      keyEl = asWhole ? unrefOrGet(el)! : targetEl;
    const state = targetStates.get(keyEl);
    if (!draggingCount || !state?.dragging) return;
    const [clientX, clientY] = finalGetCoord(e);
    Object.assign(state, { relativeX: state.dx + clientX, relativeY: state.dy + clientY, clientX, clientY });
    emitMove(targetEl, state);
  };

  let lastEl: Element | null,
    cleanFns: AnyFn[] = [];
  const clean = () => {
    if (lastEl) {
      cleanFns.forEach((f) => f());
      lastEl = null;
      cleanFns = [];
      runIfFn(onClean);
    }
  };
  watchEffect(() => {
    clean();
    const element = unrefOrGet(el);
    if (element && !unrefOrGet(disabled)) {
      cleanFns = [
        on(element, 'pointerdown', handleStart),
        on(element, 'pointerup', handleEnd),
        on(element, 'pointercancel', handleEnd),
        on(element, 'pointermove', handleMove),
        on(element, 'touchstart', prevent),
        on(element, 'dragstart', prevent),
      ];
      lastEl = element;
    }
  });
  tryOnScopeDispose(clean);
}
