import { defineSSRCustomElement } from 'custom';
import { createDefineElement, toElement } from 'utils';
import {
  scrollViewEmits,
  ScrollViewObserveViewOption,
  ScrollViewObserveViewRangeValue,
  scrollViewProps,
  ScrollViewState,
} from './type';
import { useCE } from 'hooks';
import { getCompParts } from 'common';
import {
  getRect,
  listenScroll,
  runIfFn,
  supportCSSRegisterProperty,
  toArrayIfNotNil,
  isWindow,
  getWindow,
  getDocumentElement,
  on,
  rafThrottle,
  pick,
} from '@lun/utils';
import { computed, onMounted, reactive, readonly, Transition, TransitionProps, watchEffect } from 'vue';
import { unrefOrGet, useCleanUp, useIntersectionObserver, useResizeObserver } from '@lun/core';
import { calcProgress } from './utils';

const name = 'scroll-view';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
const registered = new Set<string>();
export const ScrollView = defineSSRCustomElement({
  name,
  props: scrollViewProps,
  emits: scrollViewEmits,
  setup(props) {
    const CE = useCE();
    const target = computed(() => {
      let target = unrefOrGet(props.target),
        targetEl: Element | null | undefined,
        isWin: boolean,
        targetWinOrEl = (isWin = isWindow(target))
          ? target
          : (isWin = target === 'window')
          ? getWindow(CE)
          : (targetEl = toElement(target));
      if (!targetWinOrEl) targetWinOrEl = targetEl = CE;
      return [targetWinOrEl, targetEl || getDocumentElement(targetWinOrEl), isWin] as const;
    });
    const state = reactive({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        scrolling: false,
        xOverflow: false,
        yOverflow: false,
        xForward: false,
        xBackward: false,
        yForward: false,
        yBackward: false,
        get scrollXPercent() {
          return state.scrollX / (target.value[1].scrollWidth - state.width || 1);
        },
        get scrollYPercent() {
          return state.scrollY / (target.value[1].scrollHeight - state.height || 1);
        },
      }) as ScrollViewState,
      readonlyState = readonly(state);
    if (supportCSSRegisterProperty) {
      const register = (name: string) => {
        if (!registered.has(name) && name) {
          registered.add(name);
          (supportCSSRegisterProperty as Exclude<typeof supportCSSRegisterProperty, false>)({
            name: name,
            syntax: '<number>',
            initialValue: '0',
            inherits: true,
          });
        }
      };
      watchEffect(() => {
        const { scrollXPercentVarName = '--scroll-x-percent', scrollYPercentVarName = '--scroll-y-percent' } = props;
        register(scrollXPercentVarName);
        register(scrollYPercentVarName);
      });
    }

    const setSize = (rect: DOMRect | (ResizeObserverSize & { x: number; y: number })) => {
      state.width = Math.round((rect as DOMRect).width ?? (rect as ResizeObserverSize).inlineSize);
      state.xOverflow = state.width < target.value[1].scrollWidth;
      state.height = Math.round((rect as DOMRect).height ?? (rect as ResizeObserverSize).blockSize);
      state.yOverflow = state.height < target.value[1].scrollHeight;
      state.x = rect.x;
      state.y = rect.y;
    };
    onMounted(() => {
      setSize(getRect(target.value[1]));
    });
    // window resize
    useResizeObserver({
      targets: () => target.value[1],
      disabled: () => !props.observeResize,
      observeOptions: { box: 'border-box' },
      callback(entries) {
        let entryBoxSize = entries[0]?.borderBoxSize?.[0];
        setSize(
          entryBoxSize ? { ...entryBoxSize, ...pick(entries[0].contentRect, ['x', 'y']) } : getRect(target.value[1]),
        );
      },
    });
    type ProcessedOption = Omit<ScrollViewObserveViewOption, 'range'> & {
      range: [ScrollViewObserveViewRangeValue, ScrollViewObserveViewRangeValue];
    };
    const intersectionTargetMap = new WeakMap<Element, Record<'x' | 'y', ProcessedOption>>();
    const intersectionTargets = computed(() => {
      const { observeView } = props;
      return toArrayIfNotNil(observeView).map((v) => {
        const { target, attribute, axis } = v,
          targetEl = toElement(target),
          option = intersectionTargetMap.get(targetEl!) || ({} as Record<'x' | 'y', ProcessedOption>);
        if (!targetEl) return;
        const ranges = toArrayIfNotNil(v.range) as [ScrollViewObserveViewRangeValue, ScrollViewObserveViewRangeValue];
        ranges[0] ||= 'cover';
        ranges[1] ||= ranges[0];
        option[axis || 'y'] = {
          ...v,
          range: ranges,
        };
        intersectionTargetMap.set(targetEl, option);
        return targetEl;
      });
    });

    useIntersectionObserver({
      targets: intersectionTargets,
      observerInit: () => {
        const { value } = target;
        return {
          root: value[2] ? undefined : value[1],
        };
      },
      disabled: () => !intersectionTargets.value.length,
      callback(entries) {
        entries.forEach(({ target, intersectionRect }) => {
          const options = intersectionTargetMap.get(target);
          if (!options) return;
          const { x, y } = options;
          const yProgress = y ? calcProgress(state, intersectionRect, 'y', y.range) : 0,
            xProgress = x ? calcProgress(state, intersectionRect, 'x', x.range) : 0;
          console.log('yProgress', yProgress, xProgress);
        });
      },
    });

    const [addClean, cleanUp] = useCleanUp();
    watchEffect(() => {
      cleanUp();
      addClean(
        listenScroll(target.value[0], ({ xForward, yForward, offsetX, offsetY, scrolling }) => {
          Object.assign(state, {
            scrollX: offsetX,
            scrollY: offsetY,
            scrolling,
          });
          if (scrolling) {
            xForward !== null &&
              Object.assign(state, {
                xForward,
                xBackward: !xForward,
              });
            yForward !== null &&
              Object.assign(state, {
                yForward,
                yBackward: !yForward,
              });
          }
        }),
      );
      if (target.value[2] && props.observeResize) {
        // listen window resize
        addClean(
          on(
            target.value[0],
            'resize',
            rafThrottle(() => {
              setSize(getRect(target.value[1]));
            }),
          ),
        );
      }
    });

    const getTransitionHandlers = (enterAnimation?: any[], leaveAnimation?: any[]) => {
      return {
        onEnter(el, done) {
          const slot = el as HTMLSlotElement,
            elements = slot.assignedElements();
          enterAnimation &&
            elements.forEach((e, i) => {
              const ani = e.animate(enterAnimation[0], enterAnimation[1]);
              if (!i) ani.onfinish = done;
            });
        },
        onLeave(el, done) {
          const slot = el as HTMLSlotElement,
            elements = slot.assignedElements();
          leaveAnimation &&
            elements.forEach((e, i) => {
              const ani = e.animate(leaveAnimation[0], leaveAnimation[1]);
              if (!i) ani.onfinish = done;
            });
        },
      } as TransitionProps;
    };

    // TODO cache prevArr, don't return vnode in computed
    const slots = computed(() => {
      const { getSlots } = props;
      return toArrayIfNotNil(runIfFn(getSlots, readonlyState)).map((slot) => {
        if (!slot) return;
        const { name, enterAnimation, leaveAnimation, show } = slot,
          node = <slot name={name} v-content={show}></slot>;
        return enterAnimation || leaveAnimation ? (
          <Transition {...getTransitionHandlers(enterAnimation, leaveAnimation)}>{node}</Transition>
        ) : (
          node
        );
      });
    });

    return () => {
      const { scrollXPercentVarName = '--scroll-x-percent', scrollYPercentVarName = '--scroll-y-percent' } = props;

      return (
        <span
          part={compParts[0]}
          style={{ [scrollXPercentVarName!]: state.scrollXPercent, [scrollYPercentVarName!]: state.scrollYPercent }}
        >
          {slots.value}
          <slot></slot>
        </span>
      );
    };
  },
});

export type tScrollView = typeof ScrollView;
export type iScrollView = InstanceType<tScrollView>;

export const defineScrollView = createDefineElement(name, ScrollView, {}, parts, {});
