import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { onScopeDispose, reactive, watchEffect } from 'vue';
import { AnyFn, on, prevent, raf, runIfFn } from '@lun/utils';

export type DraggableElementState = {
  relativeX: number;
  relativeY: number;
  dx: number;
  dy: number;
  dragging: boolean;
  clientX: number;
  clientY: number;
};

export function useDraggableMonitor({
  el,
  asWhole,
  draggable,
  getCoord,
  disabled,
  animationFrames,
  onMove,
  onStop,
}: {
  el: MaybeRefLikeOrGetter<Element>;
  /** if asWhole is true, all draggable children elements consider as whole, sharing same state; otherwise, each child element has its own state */
  asWhole?: boolean;
  draggable: (target: Element, e: PointerEvent, state?: DraggableElementState) => boolean | undefined | null;
  getCoord?: (e: PointerEvent) => [number, number];
  disabled?: MaybeRefLikeOrGetter<boolean>;
  animationFrames?: number;
  onMove?: (target: Element, state: DraggableElementState) => void;
  onStop?: (target: Element, state: DraggableElementState) => void;
}) {
  const targetStates = reactive(new WeakMap<Element, DraggableElementState>());
  let draggingCount = 0;

  const finalGetCoord = (e: PointerEvent) => getCoord?.(e) || [e.clientX, e.clientY];

  const handleStart = (e: PointerEvent) => {
    const { button, target, pointerId } = e;
    if (button !== 0) return; // left button only
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
    targetEl.setPointerCapture(pointerId);
    // el.style.userSelect = 'none'; // if there's text
    // el.style.webkitUserSelect = 'none'; // safari
  };

  const handleEnd = ({ target }: PointerEvent) => {
    const targetEl = target as Element;
    const state = targetStates.get(asWhole ? unrefOrGet(el)! : targetEl);
    if (!draggingCount || !state?.dragging) return;
    draggingCount -= 1;
    // el.style.userSelect = 'auto'; // if there's text
    // el.style.webkitUserSelect = 'auto'; // safari
    state.dragging = false;
    runIfFn(onStop, targetEl, state);
  };

  const handleMove = (e: PointerEvent) => {
    const targetEl = e.target as Element,
      keyEl = asWhole ? unrefOrGet(el)! : targetEl;
    const state = targetStates.get(keyEl);
    if (!draggingCount || !state?.dragging) return;
    const [clientX, clientY] = finalGetCoord(e);
    Object.assign(state, { relativeX: state.dx + clientX, relativeY: state.dy + clientY, clientX, clientY });
    raf(() => {
      runIfFn(onMove, targetEl, state);
    }, animationFrames);
  };

  let lastEl: Element | null,
    cleanFns: AnyFn[] = [];
  const clean = () => {
    if (lastEl) {
      cleanFns.forEach((f) => f());
      lastEl = null;
      cleanFns = [];
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
  onScopeDispose(clean);
}
