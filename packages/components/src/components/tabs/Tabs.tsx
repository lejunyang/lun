import { defineCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { tabsEmits, tabsProps } from './type';
import { defineIcon } from '../icon/Icon';
import { TransitionGroup, computed, nextTick, ref, watchEffect } from 'vue';
import { registerSwipeTransition, useNamespace, useTransition } from 'hooks';
import { getCompParts } from 'common';
import { capitalize, isArray, setStyle, toPxIfNum } from '@lun-web/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { useResizeObserver, useSetupEvent } from '@lun-web/core';
import { TabsCollector } from './collector';

// TODO panel scrollable; can we have height transition when switching?
const name = 'tabs';
const parts = ['root', 'nav', 'content', 'wrapper', 'panel', 'tab', 'label'] as const;
const compParts = getCompParts(name, parts);
export const Tabs = defineCustomElement({
  name,
  props: tabsProps,
  emits: tabsEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    useSetupEvent();
    const localActive = ref();
    const showedKeys = new Set(),
      slotIndexMap = new Map<string | number, number>();
    let controlled = false,
      usingItems = false,
      activeIndex: number,
      lastActiveIndex: number;
    const wrapperRef = ref<HTMLDivElement>();
    const isActive = (slot?: string, index?: number) => {
      const { value } = localActive;
      return value == null ? index === 0 : value === slot || value === index;
    };
    const getTransitionName = () => {
      const { type } = props;
      const res =
        type === 'vertical'
          ? activeIndex > lastActiveIndex
            ? 'swipeUp'
            : 'swipeDown'
          : activeIndex > lastActiveIndex
          ? 'swipeLeft'
          : 'swipeRight';
      return res;
    };
    const transitionEnd = () => (lastActiveIndex = activeIndex);
    const context = TabsCollector.parent({
      extraProvide: {
        isActive,
        getTransitionName,
        transitionEnd,
      },
    });

    watchEffect(() => {
      const { activeSlot, defaultActiveSlot } = props;
      let active: any;
      if ((controlled = activeSlot != null)) active = localActive.value = activeSlot;
      else if (defaultActiveSlot != null) active = localActive.value = defaultActiveSlot;
      // if (localActive.value != null) showedKeys.add(localActive.value); // read localActive will collect it as a dependency
      activeIndex = slotIndexMap.get(active) || 0;
      if (active != null) showedKeys.add(active);
    });

    const getTabClickHandler = (slot: string, i: number, disabled?: boolean) => () => {
      if (!disabled) {
        const final = slot || i;
        emit('update', final);
        if (!controlled) {
          localActive.value = final;
          activeIndex = i;
          showedKeys.add(final);
        }
      }
    };
    const tabs = computed(() =>
      (usingItems = isArray(props.items))
        ? props.items.filter(Boolean).map((t, i) => {
            if (!i) slotIndexMap.clear();
            const slot = String(t.slot || ''); // ignore falsy slot, will use index number as key, do not convert index number to string(as there may be some items having number string as its slot)
            slotIndexMap.set(slot, i);
            return {
              ...t,
              slot,
              onClick: getTabClickHandler(slot, i, t.disabled),
            };
          })
        : null,
    );
    const childrenTabs = computed(() =>
      context.value.flatMap(({ props: { label, slot, disabled } }, i) => {
        if (!i) slotIndexMap.clear();
        if (!slot) return [];
        slotIndexMap.set(slot, i);
        return [
          {
            slot: slot as string,
            disabled,
            label,
            onClick: getTabClickHandler(slot, i, disabled),
          },
        ];
      }),
    );

    const updateVar = () => {
      const { value } = wrapperRef,
        el = value?.children[activeIndex] as HTMLElement;
      if (!el) return;
      const label = el.children[0] as HTMLElement,
        fields = ['width', 'height', 'left', 'top'];
      setStyle(
        value,
        ns.v(
          fields.reduce((res, f) => {
            // @ts-ignore
            res[`active-label-${f}`] = toPxIfNum(label[`offset${capitalize(f)}`]);
            // @ts-ignore
            res[`active-tab-${f}`] = toPxIfNum(el[`offset${capitalize(f)}`]);
            return res;
          }, {}),
        ),
      );
    };

    // must use ResizeObserver to update CSS vars, as tab's label may get updated, or tabs may not be renderer(display: none) on mounted, at that time offsetWidth is 0
    useResizeObserver({
      targets: wrapperRef,
      callback: updateVar,
    });

    const transition = useTransition(props, name, 'panel', getTransitionName);

    return () => {
      const { destroyInactive, forceRender, type, noPanel } = props;
      const transitionAttrs = {
        tag: 'div',
        class: ns.e('content'),
        part: compParts[1],
      };
      return (
        <div class={[ns.t, ns.m(type)]} part={compParts[0]}>
          <div class={ns.e('nav')} part={compParts[1]}>
            <div class={ns.e('wrapper')} part={compParts[3]} ref={wrapperRef}>
              {(tabs.value || childrenTabs.value).map((t, i) => {
                const active = isActive(t.slot, i);
                if (active) {
                  activeIndex = i;
                  lastActiveIndex ??= i;
                  showedKeys.add(t.slot || i);
                  nextTick(updateVar);
                }
                return (
                  <div
                    class={[ns.e('tab'), ns.is('disabled', t.disabled), ns.is('active', active)]}
                    part={compParts[5]}
                    onClick={t.onClick}
                  >
                    <span class={ns.e('label')} part={compParts[6]}>
                      {renderCustom(t.label)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {!noPanel && (
            <TransitionGroup {...transition()} {...transitionAttrs} onAfterEnter={transitionEnd}>
              {usingItems
                ? tabs
                    .value!.map((t, i) => {
                      const key = t.slot || i;
                      const active = isActive(t.slot, i);
                      return (
                        (active ||
                          (t.forceRender ?? forceRender) ||
                          (showedKeys.has(key) && !(t.destroyInactive ?? destroyInactive))) && (
                          <div
                            key={key}
                            class={[ns.e('panel'), ns.is('disabled', t.disabled), ns.is('active', active)]}
                            part={compParts[4]}
                            v-content={active}
                          >
                            {renderCustom(t.panel)}
                          </div>
                        )
                      );
                    })
                    // must filter, TransitionGroup requires valid child with key
                    .filter(Boolean)
                : // render all slots to have transition on children
                  childrenTabs.value.map((t) => <slot key={t.slot} name={t.slot}></slot>)}
            </TransitionGroup>
          )}
        </div>
      );
    };
  },
});

export type tTabs = typeof Tabs;
export type iTabs = InstanceType<tTabs>;

export const defineTabs = createDefineElement(
  name,
  Tabs,
  {
    type: 'horizontal',
  },
  parts,
  {
    common: registerSwipeTransition,
    icon: defineIcon,
  },
);
