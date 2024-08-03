import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { tabsEmits, tabsProps } from './type';
import { defineIcon } from '../icon/Icon';
import { TransitionGroup, computed, onMounted, ref, watchEffect } from 'vue';
import { useNamespace } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';
import { isArray, setStyle } from '@lun/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { useSetupEvent } from '@lun/core';

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

    watchEffect(() => {
      const { activeSlot, defaultActiveSlot } = props;
      if ((controlled = activeSlot != null)) localActive.value = activeSlot;
      else if (defaultActiveSlot != null) localActive.value = defaultActiveSlot;
      else localActive.value = tabs.value[0]?.slot ?? '0';
      showedKeys.add(localActive.value);
    });

    const tabs = computed(() =>
      isArray(props.items)
        ? props.items
            .map((t, i) => {
              const slot = String(t.slot ?? i),
                active = localActive.value === slot;
              if (active) {
                activeIndex = i;
                if (controlled) updateVar(i);
              }
              return {
                ...t,
                slot,
                active,
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
          'active-label-width': label.offsetWidth,
          'active-label-height': label.offsetHeight,
          'active-tab-width': el.offsetWidth,
          'active-tab-height': el.offsetHeight,
        }),
      );
    };
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
            <div class={ns.e('wrapper')} part={compParts[3]}>
              {tabs.value.map((t) => (
                <div
                  class={[ns.e('tab'), ns.is('disabled', t.disabled), ns.is('active', t.active)]}
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
                return (
                  (t.active ||
                    (t.forceRender ?? forceRender) ||
                    (showedKeys.has(t.slot) && !(t.destroyInactive ?? destroyInactive))) && (
                    <div
                      key={t.slot ?? i}
                      class={[ns.e('panel'), ns.is('disabled', t.disabled), ns.is('active', t.active)]}
                      part={compParts[4]}
                      v-show={t.active}
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
