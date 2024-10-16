import { defineSSRCustomElement } from 'custom';
import { createDefineElement, toElement } from 'utils';
import {
  scrollViewEmits,
  ScrollViewObserveViewOption,
  ScrollViewRangeValue,
  scrollViewProps,
  ScrollViewSlot,
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
  setStyle,
  getCSSVarName,
} from '@lun/utils';
import { computed, onMounted, reactive, readonly, ref, Transition, TransitionProps, watch, watchEffect } from 'vue';
import { unrefOrGet, useCleanUp, useResizeObserver } from '@lun/core';
import { calcProgress, measureSubject } from './utils';

const name = 'scroll-view';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
const registered = new Set<string>();
const register = (name?: string) => {
  if (!name) return '';
  name = getCSSVarName(name);
  if (supportCSSRegisterProperty && !registered.has(name)) {
    registered.add(name);
    supportCSSRegisterProperty({
      name: name,
      syntax: '<number>',
      initialValue: '0',
      inherits: true,
    });
  }
  return name;
};
export const ScrollView = defineSSRCustomElement({
  name,
  props: scrollViewProps,
  emits: scrollViewEmits,
  setup(props) {
    const CE = useCE(),
      root = ref<HTMLElement>();
    const scroller = computed(() => {
      let target = unrefOrGet(props.target),
        targetEl: Element | null | undefined,
        isWin: boolean,
        targetWinOrEl = (isWin = isWindow(target))
          ? target
          : (isWin = target === 'window')
          ? getWindow(CE)
          : (targetEl = toElement(target));
      if (!targetWinOrEl) targetWinOrEl = targetEl = CE;
      return [targetWinOrEl, (targetEl as HTMLElement) || getDocumentElement(targetWinOrEl), isWin] as const;
    });
    const state: ScrollViewState = reactive({
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
        get scrollXProgress() {
          return state.scrollX / (scroller.value[1].scrollWidth - state.width || 1);
        },
        get scrollYProgress() {
          return state.scrollY / (scroller.value[1].scrollHeight - state.height || 1);
        },
      }),
      readonlyState = readonly(state),
      viewProgress = reactive({}) as Record<string, number>,
      readonlyProgress = readonly(viewProgress);

    watchEffect(() => {
      if (root.value) {
        const { scrollXProgressVarName, scrollYProgressVarName } = props;
        setStyle(root.value, {
          ...viewProgress,
          [register(scrollXProgressVarName)]: state.scrollXProgress,
          [register(scrollYProgressVarName)]: state.scrollYProgress,
        });
      }
    });

    const setSize = (rect: DOMRect | (ResizeObserverSize & { x: number; y: number })) => {
      state.width = Math.round((rect as DOMRect).width ?? (rect as ResizeObserverSize).inlineSize);
      state.xOverflow = state.width < scroller.value[1].scrollWidth;
      state.height = Math.round((rect as DOMRect).height ?? (rect as ResizeObserverSize).blockSize);
      state.yOverflow = state.height < scroller.value[1].scrollHeight;
      state.x = rect.x;
      state.y = rect.y;
    };
    onMounted(() => {
      setSize(getRect(scroller.value[1]));
      intersectionTargets.value; // access it to trigger initial update
    });
    // window resize
    useResizeObserver({
      targets: () => scroller.value[1],
      disabled: () => !props.observeResize,
      observeOptions: { box: 'border-box' },
      callback(entries) {
        let entryBoxSize = entries[0]?.borderBoxSize?.[0];
        setSize(
          entryBoxSize ? { ...entryBoxSize, ...pick(entries[0].contentRect, ['x', 'y']) } : getRect(scroller.value[1]),
        );
      },
    });
    type ProcessedOption = Omit<ScrollViewObserveViewOption, 'range'> & {
      range: [ScrollViewRangeValue, ScrollViewRangeValue];
      measurement: ReturnType<typeof measureSubject>;
    };
    const intersectionTargetMap = new WeakMap<Element, Record<'x' | 'y', ProcessedOption>>();
    const updateViewProgress = (el?: Element) => {
      const options = intersectionTargetMap.get(el!);
      if (!options) return;
      const { x, y } = options;
      if (y) {
        const newProgress = calcProgress(state, y.measurement, 'y', y.range);
        if (newProgress !== viewProgress[y.progressVarName])
          runIfFn(y.onUpdate, (viewProgress[y.progressVarName] = newProgress));
      }
      if (x) {
        const newProgress = calcProgress(state, x.measurement, 'x', x.range);
        if (newProgress !== viewProgress[x.progressVarName])
          runIfFn(x.onUpdate, (viewProgress[x.progressVarName] = newProgress));
      }
    };
    const intersectionTargets = computed(() => {
      const { observeView } = props;
      return toArrayIfNotNil(observeView).map((v) => {
        let { target, axis, progressVarName } = v,
          targetEl = toElement(unrefOrGet(target), CE) as HTMLElement,
          option = intersectionTargetMap.get(targetEl!) || ({} as Record<'x' | 'y', ProcessedOption>);
        if (!targetEl) return;
        progressVarName = register(progressVarName);
        if (viewProgress[progressVarName] == null) viewProgress[progressVarName] = 0;
        const ranges = toArrayIfNotNil(v.range) as [ScrollViewRangeValue, ScrollViewRangeValue];
        ranges[0] ||= 'cover';
        ranges[1] ||= ranges[0];
        option[axis || 'y'] = {
          ...v,
          range: ranges,
          measurement: measureSubject(scroller.value[1], targetEl), // TODO observe resize
        };
        intersectionTargetMap.set(targetEl, option);
        return targetEl;
      });
    });
    watch(intersectionTargets, (els) => {
      els.forEach((el) => updateViewProgress(el));
    });

    const [addClean, cleanUp] = useCleanUp();
    watchEffect(() => {
      cleanUp();
      addClean(
        listenScroll(scroller.value[0], ({ xForward, yForward, offsetX, offsetY, scrolling }) => {
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
            intersectionTargets.value.forEach((el) => {
              updateViewProgress(el);
            });
          }
        }),
      );
      if (scroller.value[2] && props.observeResize) {
        // listen window resize
        addClean(
          on(
            scroller.value[0],
            'resize',
            rafThrottle(() => {
              setSize(getRect(scroller.value[1]));
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

    const slots = computed<ScrollViewSlot[]>((old) => {
      const { getSlots } = props;
      return toArrayIfNotNil(runIfFn(getSlots, readonlyState, readonlyProgress, old)).filter(Boolean);
    });

    return () => {
      return (
        <span part={compParts[0]} ref={root}>
          {slots.value.map((slot) => {
            const { name, enterAnimation, leaveAnimation, show } = slot,
              node = <slot name={name} v-content={show}></slot>;
            return enterAnimation || leaveAnimation ? (
              <Transition {...getTransitionHandlers(enterAnimation, leaveAnimation)}>{node}</Transition>
            ) : (
              node
            );
          })}
          <slot></slot>
        </span>
      );
    };
  },
});

export type tScrollView = typeof ScrollView;
export type iScrollView = InstanceType<tScrollView>;

export const defineScrollView = createDefineElement(
  name,
  ScrollView,
  {
    scrollXProgressVarName: 'scroll-x-progress',
    scrollYProgressVarName: 'scroll-y-progress',
  },
  parts,
  {},
);
