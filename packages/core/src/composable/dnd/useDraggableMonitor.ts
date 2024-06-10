import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { reactive, watchEffect } from 'vue';
import { AnyFn, clamp, on, prevent, rafThrottle, runIfFn, floorByDPR } from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks';
import { useInlineStyleManager } from '../dialog/useInlineStyleManager';

export type DraggableElementState = {
  /** x relative to target's original position, can be used in transform */
  relativeX: number;
  relativeY: number;
  /** from target's left edge to container's left edge */
  readonly left: number;
  readonly top: number;
  dx: number;
  dy: number;
  /** initial left of target */
  iLeft: number;
  iTop: number;
  dragging: boolean;
  clientX: number;
  clientY: number;
  limitType?: 'pointer' | 'target';
  /** offset X of pointer down point to container's left edge */
  containerOffsetX: number;
  containerOffsetY: number;
  /** x of pointer when start dragging, relative to the viewport */
  startX: number;
  startY: number;
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
  limitInContainer,
  getTargetRect,
}: {
  /** the container element that contains draggable elements */
  el: MaybeRefLikeOrGetter<Element>;
  /** if asWhole is true, all draggable children elements consider as a whole, sharing same state; otherwise, each child element has its own state */
  asWhole?: boolean;
  draggable: DraggableFn;
  getCoord?: (e: PointerEvent) => [number, number];
  disabled?: MaybeRefLikeOrGetter<boolean>;
  animationFrames?: number;
  onMove?: (target: Element, state: DraggableElementState) => void;
  onStop?: (target: Element, state: DraggableElementState) => void;
  onClean?: () => void;
  ignoreWhenAlt?: boolean;
  /** used to apply limitation on coordinates so that pointer or target's coordinates can not be out of container when dragging */
  limitInContainer?: 'pointer' | 'target' | ((target: Element, state: DraggableElementState) => 'pointer' | 'target');
  getTargetRect?: (target: Element) => DOMRect;
}) {
  const targetStates = reactive(new WeakMap<Element, DraggableElementState>());
  let draggingCount = 0;
  const [storeAndSetStyle, restoreElStyle] = useInlineStyleManager();

  const finalGetCoord = (e: PointerEvent) => getCoord?.(e) || [e.clientX, e.clientY];
  const finalGetTargetRect = (target: Element) => getTargetRect?.(target) || target.getBoundingClientRect();

  const handleStart = (e: PointerEvent) => {
    const { button, target, pointerId, altKey } = e;
    if (button !== 0 || (ignoreWhenAlt && altKey)) return; // left button only
    const targetEl = target as Element,
      keyEl = asWhole ? unrefOrGet(el)! : targetEl;
    const state = targetStates.get(keyEl);
    if (!draggable(targetEl, e, state)) return;
    const [clientX, clientY] = finalGetCoord(e);
    const limitType = runIfFn(limitInContainer, targetEl, state);
    const container = unrefOrGet(el)!;
    const { x, y } = container.getBoundingClientRect();
    const { x: tx, y: ty } = finalGetTargetRect(targetEl);
    // must calculate containerOffset here, not in handleMove, because target's x/y is changing during dragging, small pixels change can make it gradually out of container
    const containerOffsetX = clientX - tx,
      containerOffsetY = clientY - ty,
      startX = x + containerOffsetX,
      startY = y + containerOffsetY;
    const common = {
      dragging: true,
      clientX,
      clientY,
      limitType,
      startX,
      startY,
      containerOffsetX,
      containerOffsetY,
      iLeft: tx - x,
      iTop: ty - y,
    };
    if (!state) {
      targetStates.set(keyEl, {
        relativeX: 0,
        relativeY: 0,
        dx: -clientX,
        dy: -clientY,
        ...common,
        get left() {
          return this.iLeft + this.relativeX;
        },
        get top() {
          return this.iTop + this.relativeY;
        },
      });
    } else {
      Object.assign(state, {
        dx: state.relativeX - clientX,
        dy: state.relativeY - clientY,
        relativeX: clientX,
        relativeY: clientY,
        ...common,
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
      container = unrefOrGet(el)!,
      keyEl = asWhole ? container : targetEl;
    const state = targetStates.get(keyEl);
    if (!draggingCount || !state?.dragging) return;
    let [clientX, clientY] = finalGetCoord(e);
    const { limitType, startX, startY, containerOffsetX, containerOffsetY } = state;
    const { x, y, right, bottom } = container.getBoundingClientRect();
    if (limitType === 'pointer') {
      clientX = floorByDPR(clamp(clientX, x, right), targetEl);
      clientY = floorByDPR(clamp(clientY, y, bottom), targetEl);
    } else if (limitType === 'target') {
      const { width, height } = finalGetTargetRect(targetEl);
      // was using roundByDPR before, but round can actually make it overflow the container when we drag it to the bottom right corner, and then scrollbars appear
      clientX = floorByDPR(clamp(clientX, startX, right - width + containerOffsetX), targetEl);
      clientY = floorByDPR(clamp(clientY, startY, bottom - height + containerOffsetY), targetEl);
    }
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
