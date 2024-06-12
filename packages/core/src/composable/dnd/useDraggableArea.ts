import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { reactive, watchEffect } from 'vue';
import { AnyFn, clamp, on, prevent, rafThrottle, runIfFn, floorByDPR, numbersEqual } from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks';
import { useTempInlineStyle } from '../dialog/useTempInlineStyle';

// greatly inspired by https://www.redblobgames.com/making-of/draggable/

export type DraggableElementState = {
  /** x relative to target's original position, can be used in transform */
  relativeX: number;
  relativeY: number;
  /** from target's left edge to container's left edge */
  readonly left: number;
  readonly top: number;
  /** initial left when dragging starts */
  iLeft: number;
  iTop: number;
  dx: number;
  dy: number;
  dragging: boolean;
  /** pointer's clientX */
  clientX: number;
  clientY: number;
  /** left edge of target's bounding rect to the viewport */
  clientLeft: number;
  /** top of target's rect */
  clientTop: number;
  /** initial clientLeft when dragging starts */
  iClientLeft: number;
  iClientTop: number;
  limitType?: 'pointer' | 'target';
  /** offset X of pointer down point to container's left edge */
  pointerOffsetX: number;
  pointerOffsetY: number;
  /** x of pointer when start dragging, relative to the viewport */
  startX: number;
  startY: number;
  pointerId: number;
};

export type DraggableFn = (
  target: Element,
  e: PointerEvent,
  state?: DraggableElementState,
) => boolean | undefined | null;

export function useDraggableArea({
  el,
  asWhole,
  draggable,
  getCoord,
  disabled,
  animationFrames,
  axis,
  onMove,
  onStop,
  onClean,
  ignoreWhenAlt,
  limitInContainer,
  getTargetRect,
  rememberRelative = true,
}: {
  /** the container element that contains draggable elements */
  el: MaybeRefLikeOrGetter<Element>;
  /** if asWhole is true, all draggable children elements consider as a whole, sharing same state; otherwise, each child element has its own state */
  asWhole?: boolean;
  draggable: DraggableFn;
  getCoord?: (e: PointerEvent) => [number, number];
  disabled?: MaybeRefLikeOrGetter<boolean>;
  animationFrames?: number;
  /** other values represent both x and y */
  axis?: 'x' | 'y';
  /** return false to prevent updating */
  onMove?: (target: Element, state: DraggableElementState, oldState: DraggableElementState) => void | boolean;
  onStop?: (target: Element, state: DraggableElementState) => void;
  onClean?: () => void;
  /** ignore dragging when alt key is pressed */
  ignoreWhenAlt?: boolean;
  /** used to apply limitation on coordinates so that pointer or target's coordinates can not be out of container when dragging */
  limitInContainer?: 'pointer' | 'target' | ((target: Element, state?: DraggableElementState) => 'pointer' | 'target');
  getTargetRect?: (target: Element) => DOMRect;
  rememberRelative?: boolean;
}) {
  const targetStates = reactive(new WeakMap<Element, DraggableElementState>());
  let draggingCount = 0;
  const [storeAndSetStyle, restoreElStyle] = useTempInlineStyle(true);

  const finalGetCoord = (e: PointerEvent) => getCoord?.(e) || [e.clientX, e.clientY];
  const finalGetTargetRect = (target: Element) => getTargetRect?.(target) || target.getBoundingClientRect();

  const getState = (options: Omit<DraggableElementState, 'left' | 'top' | 'clientLeft' | 'clientTop'>) =>
    ({
      ...options,
      get left() {
        return this.iLeft + this.relativeX;
      },
      get top() {
        return this.iTop + this.relativeY;
      },
      get clientLeft() {
        return this.iClientLeft + this.relativeX;
      },
      get clientTop() {
        return this.iClientTop + this.relativeY;
      },
    } as DraggableElementState);

  const handleStart = (e: PointerEvent) => {
    const { button, target, pointerId, altKey } = e;
    if (button !== 0 || (ignoreWhenAlt && altKey)) return; // left button only
    const targetEl = target as Element,
      keyEl = asWhole ? unrefOrGet(el)! : targetEl;
    const state = targetStates.get(keyEl);
    if (!draggable(targetEl, e, state)) return;
    e.stopPropagation(); // for nested
    const [clientX, clientY] = finalGetCoord(e);
    const limitType = runIfFn(limitInContainer, targetEl, state);
    const container = unrefOrGet(el)!;
    const { x, y } = container.getBoundingClientRect();
    const { x: tx, y: ty } = finalGetTargetRect(targetEl);
    // must calculate containerOffset here, not in handleMove, because target's x/y is changing during dragging, small pixels change can make it gradually out of container
    const pointerOffsetX = clientX - tx,
      pointerOffsetY = clientY - ty,
      startX = x + pointerOffsetX,
      startY = y + pointerOffsetY;
    const common = {
      dragging: true,
      clientX,
      clientY,
      limitType,
      startX,
      startY,
      pointerOffsetX,
      pointerOffsetY,
      iLeft: tx - x,
      iTop: ty - y,
      iClientLeft: tx,
      iClientTop: ty,
      pointerId,
    };
    if (!state || !rememberRelative) {
      targetStates.set(
        keyEl,
        getState({
          relativeX: 0,
          relativeY: 0,
          dx: -clientX,
          dy: -clientY,
          ...common,
        }),
      );
    } else {
      Object.assign(state, {
        dx: state.relativeX - clientX,
        dy: state.relativeY - clientY,
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

  const emitMove = rafThrottle(
    (el: Element, state: DraggableElementState, oldState: DraggableElementState, keyEl: Element) => {
      if (runIfFn(onMove, el, state, oldState) !== false) {
        targetStates.set(keyEl, state);
      }
    },
    animationFrames,
  );

  const handleMove = (e: PointerEvent) => {
    const targetEl = e.target as Element,
      container = unrefOrGet(el)!,
      keyEl = asWhole ? container : targetEl;
    const state = targetStates.get(keyEl);
    // check pointerId for touch devices simultaneous dragging
    if (!draggingCount || !state?.dragging || state.pointerId !== e.pointerId) return;
    e.stopPropagation(); // for nested
    let [clientX, clientY] = finalGetCoord(e);
    const { limitType, startX, startY, pointerOffsetX, pointerOffsetY } = state;
    const { x, y, right, bottom } = container.getBoundingClientRect();
    if (limitType === 'pointer') {
      clientX = floorByDPR(clamp(clientX, x, right), targetEl);
      clientY = floorByDPR(clamp(clientY, y, bottom), targetEl);
    } else if (limitType === 'target') {
      const { width, height } = finalGetTargetRect(targetEl);
      // was using roundByDPR before, but round can actually make it overflow the container when we drag it to the bottom right corner, and then scrollbars appear
      clientX = floorByDPR(clamp(clientX, startX, right - width + pointerOffsetX), targetEl);
      clientY = floorByDPR(clamp(clientY, startY, bottom - height + pointerOffsetY), targetEl);
    }
    const relativeX = state.dx + clientX,
      relativeY = state.dy + clientY;
    // not changed, return
    if (
      (numbersEqual(relativeX, state.relativeX) || axis === 'y') &&
      (numbersEqual(relativeY, state.relativeY) || axis === 'x')
    )
      return;
    const newState = getState({
      ...state,
      relativeX,
      relativeY,
      clientX,
      clientY,
    });
    emitMove(targetEl, newState, state, keyEl);
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
        on(element, 'lostpointercapture', handleEnd),
      ];
      lastEl = element;
    }
  });
  tryOnScopeDispose(clean);
}
