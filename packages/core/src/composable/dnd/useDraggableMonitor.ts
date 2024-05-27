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

export function useDraggableMonitor(options: {
  el: MaybeRefLikeOrGetter<Element>;
  draggable: (target: Element, state?: DraggableElementState) => boolean;
  getCoord?: (e: PointerEvent) => [number, number];
  disabled?: MaybeRefLikeOrGetter<boolean>;
  animationFrames?: number;
  onMove?: (target: Element, state: DraggableElementState) => void;
  onStop?: (target: Element, state: DraggableElementState) => void;
}) {
  const targetStates = reactive(new WeakMap<Element, DraggableElementState>());
  let draggingCount = 0;

  const getCoord = (e: PointerEvent) => options.getCoord?.(e) || [e.clientX, e.clientY];

  const handleStart = (e: PointerEvent) => {
    const { button, target, pointerId } = e;
    if (button !== 0) return; // left button only
    const el = target as Element;
    const state = targetStates.get(el);
    if (!options.draggable(el, state)) return;
    const [clientX, clientY] = getCoord(e);
    if (!state) {
      targetStates.set(el, {
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
    el.setPointerCapture(pointerId);
    // el.style.userSelect = 'none'; // if there's text
    // el.style.webkitUserSelect = 'none'; // safari
  };

  const handleEnd = ({ target }: PointerEvent) => {
    const el = target as Element;
    const state = targetStates.get(el);
    if (!draggingCount || !state?.dragging) return;
    draggingCount -= 1;
    // el.style.userSelect = 'auto'; // if there's text
    // el.style.webkitUserSelect = 'auto'; // safari
    state.dragging = false;
    runIfFn(options.onStop, el, state);
  };

  const handleMove = (e: PointerEvent) => {
    const el = e.target as Element;
    const state = targetStates.get(el);
    if (!draggingCount || !state?.dragging) return;
    const [clientX, clientY] = getCoord(e);
    Object.assign(state, { relativeX: state.dx + clientX, relativeY: state.dy + clientY, clientX, clientY });
    const { onMove, animationFrames } = options;
    raf(() => {
      runIfFn(onMove, el, state);
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
    const { disabled, el } = options;
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
