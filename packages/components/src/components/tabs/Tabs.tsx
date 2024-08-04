import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { tabsEmits, tabsProps } from './type';
import { defineIcon } from '../icon/Icon';
import { TransitionGroup, computed, onMounted, ref, watchEffect } from 'vue';
import { useNamespace } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';
import { isArray, setStyle, toPxIfNum } from '@lun/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { useSetupEvent } from '@lun/core';
import { TabsCollector } from './collector';

const name = 'tabs';
const parts = ['root', 'nav', 'content', 'wrapper', 'panel', 'tab', 'label'] as const;
const compParts = getCompParts(name, parts);
export const Tabs = defineSSRCustomElement({
  name,
  props: tabsProps,
  emits: tabsEmits,
  setup(props, { emit: e }) {
    const ns = useNamespace(name);
    const emit = useSetupEvent<typeof e>();
    const localActive = ref();
    const showedKeys = new Set();
    let controlled = false,
      activeIndex: number;
    const wrapperRef = ref<HTMLDivElement>();
    const isActive = (slot?: string, index?: number) => {
      const { value } = localActive;
      return value == null ? index === 0 : value === slot || value === index;
    };
    const context = TabsCollector.parent({
      extraProvide: {
        isActive,
      },
    });

    watchEffect(() => {
      const { activeSlot, defaultActiveSlot } = props;
      if ((controlled = activeSlot != null)) localActive.value = activeSlot;
      else if (defaultActiveSlot != null) localActive.value = defaultActiveSlot;
      if (localActive.value != null) showedKeys.add(localActive.value);
    });

    const tabs = computed(() =>
      isArray(props.items)
        ? props.items
            .map((t, i) => {
              const slot = String(t.slot || ''); // ignore falsy slot, will use index number as key, do not convert index number to string(as there may be some items having number string as its slot)
              return {
                ...t,
                slot,
                onClick: () => {
                  if (!t.disabled) {
                    emit('update', slot);
                    if (!controlled) {
                      localActive.value = slot;
                      showedKeys.add(slot);
                      updateVar(i);
                    }
                  }
                },
              };
            })
            .filter(Boolean)
        : [],
    );

    const updateVar = (index = activeIndex) => {
      const el = wrapperRef.value!.children[index] as HTMLElement,
        label = el.children[0] as HTMLElement;
      setStyle(
        el,
        ns.v({
          'active-label-width': toPxIfNum(label.offsetWidth),
          'active-label-height': toPxIfNum(label.offsetHeight),
          'active-tab-width': toPxIfNum(el.offsetWidth),
          'active-tab-height': toPxIfNum(el.offsetHeight),
        }),
      );
    };
    // TODO hover: set hover vars
    onMounted(() => updateVar());
    return () => {
      const { destroyInactive, forceRender, type } = props;
      const transitionAttrs = {
        tag: 'div',
        class: ns.e('content'),
        part: compParts[1],
      };
      return (
        <div class={[ns.t, ns.m(type)]} part={compParts[0]}>
          <div class={ns.e('nav')} part={compParts[1]}>
            <div class={ns.e('wrapper')} part={compParts[3]} ref={wrapperRef}>
              {tabs.value.map((t, i) => (
                <div
                  class={[ns.e('tab'), ns.is('disabled', t.disabled), ns.is('active', isActive(t.slot, i))]}
                  part={compParts[5]}
                  onClick={t.onClick}
                >
                  <span class={ns.e('label')} part={compParts[6]}>
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <TransitionGroup {...getTransitionProps(props, 'panel', 'panel')} {...transitionAttrs}>
            {tabs.value
              .map((t, i) => {
                const key = t.slot || i;
                const active = isActive(t.slot, i);
                if (active) {
                  activeIndex = i;
                  showedKeys.add(t.slot);
                  if (controlled) updateVar(i);
                }
                return (
                  (active ||
                    (t.forceRender ?? forceRender) ||
                    (showedKeys.has(key) && !(t.destroyInactive ?? destroyInactive))) && (
                    <div
                      key={key}
                      class={[ns.e('panel'), ns.is('disabled', t.disabled), ns.is('active', active)]}
                      part={compParts[4]}
                      v-show={active}
                    >
                      {renderCustom(t.content)}
                    </div>
                  )
                );
              })
              // must filter, TransitionGroup requires valid child with key
              .filter(Boolean)}
          </TransitionGroup>
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
    icon: defineIcon,
  },
);
