import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { reactive, watchEffect } from 'vue';
import { AnyFn, clamp, on, prevent, rafThrottle, runIfFn, numbersEqual, getRect, roundByDPR } from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks';
import { useTempInlineStyle } from '../dialog/useTempInlineStyle';

// https://www.redblobgames.com/making-of/draggable/

export type DraggableLimitType = 'point' | 'bound' | 'center';

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
  /** @private used to calculate relativeX */
  dx: number;
  dy: number;
  dragging: boolean;
  /** pointer's current clientX */
  clientX: number;
  clientY: number;
  /** from left edge of target's bounding rect to the viewport */
  clientLeft: number;
  /** from top edge of target's bounding rect to the viewport */
  clientTop: number;
  /** initial clientLeft when dragging starts */
  iClientLeft: number;
  iClientTop: number;
  limitType?: DraggableLimitType;
  /** offset X from initial pointer down point to target's left edge */
  iOffsetX: number;
  iOffsetY: number;
  /** min x for target that will not overflow the container */
  minX: number;
  minY: number;
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
  nested,
}: {
  /** the container element that contains draggable elements */
  el: MaybeRefLikeOrGetter<Element>;
  /** if asWhole is true, all draggable children elements consider as a whole, sharing same state; otherwise, each child element has its own state */
  asWhole?: boolean;
  draggable: DraggableFn;
  getCoord?: (e: PointerEvent) => [number, number];
  disabled?: MaybeRefLikeOrGetter<boolean>;
  animationFrames?: number;
  /** indicate draggable target will only be dragged along x or y axis, used to avoid unnecessary onMove calls. values other than 'x' or 'y' represent both x and y */
  axis?: 'x' | 'y';
  /** return false to prevent updating */
  onMove?: (target: Element, state: DraggableElementState, oldState: DraggableElementState) => void | boolean;
  onStop?: (target: Element, state: DraggableElementState) => void;
  onClean?: () => void;
  /** ignore dragging when alt key is pressed */
  ignoreWhenAlt?: boolean;
  /**
   * used to apply limitation on coordinates
   * - 'point': dragging point can not be outside container's boundary
   * - 'bound': target's boundary can not be outside container's boundary
   * - 'center': target's center point can not be outside container's boundary
   */
  limitInContainer?: DraggableLimitType | ((target: Element, state?: DraggableElementState) => DraggableLimitType);
  getTargetRect?: (target: Element) => DOMRect;
  rememberRelative?: boolean;
  /** haven't tested */
  nested?: boolean;
}) {
  const targetStates = reactive(new WeakMap<Element, DraggableElementState>());
  let draggingCount = 0;
  const [storeAndSetStyle, restoreElStyle] = useTempInlineStyle(true);

  const finalGetCoord = (e: PointerEvent) => getCoord?.(e) || [e.clientX, e.clientY];
  const finalGetTargetRect = (target: Element) => getTargetRect?.(target) || getRect(target);

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
    // sometimes we can't stopPropagation, e.g. in popover content(ColorPicker). Popover also listens to pointerdown event to prevent unexpected closing
    if (nested) e.stopPropagation(); // for nested
    const [clientX, clientY] = finalGetCoord(e);
    const limitType = runIfFn(limitInContainer, targetEl, state);
    const container = unrefOrGet(el)!;
    const { x, y } = getRect(container);
    const { x: tx, y: ty } = finalGetTargetRect(targetEl);
    // must calculate offset here, not in handleMove, as clientX is always changing
    const iOffsetX = clientX - tx, // not using e.offsetX, as we may customize clientX by getCoord
      iOffsetY = clientY - ty,
      minX = x + iOffsetX,
      minY = y + iOffsetY;
    const common = {
      dragging: true,
      clientX,
      clientY,
      limitType,
      minX,
      minY,
      iOffsetX,
      iOffsetY,
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
    if (nested) e.stopPropagation(); // for nested
    let [clientX, clientY] = finalGetCoord(e);
    const { limitType, minX, minY, iOffsetX, iOffsetY } = state;
    const { x, y, right, bottom } = getRect(container);
    clientX = roundByDPR(clientX, targetEl);
    clientY = roundByDPR(clientY, targetEl);
    if (limitType === 'point') {
      clientX = clamp(clientX, x, right);
      clientY = clamp(clientY, y, bottom);
    } else if (limitType === 'bound') {
      const { width, height } = finalGetTargetRect(targetEl);
      clientX = clamp(clientX, minX, right - width + iOffsetX);
      clientY = clamp(clientY, minY, bottom - height + iOffsetY);
    } else if (limitType === 'center') {
      const { width, height } = finalGetTargetRect(targetEl);
      clientX = clamp(clientX, x + iOffsetX - width / 2, right + iOffsetX - width / 2);
      clientY = clamp(clientY, y + iOffsetY - height / 2, bottom + iOffsetY - height / 2);
    }
    const relativeX = state.dx + clientX,
      relativeY = state.dy + clientY;
    // not changed, return
    if (
      (numbersEqual(relativeX, state.relativeX) || axis === 'y') &&
      (numbersEqual(relativeY, state.relativeY) || axis === 'x')
    )
      return;
    emitMove(
      targetEl,
      getState({
        ...state,
        relativeX,
        relativeY,
        clientX,
        clientY,
      }),
      state,
      keyEl,
    );
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

  return targetStates;
}
