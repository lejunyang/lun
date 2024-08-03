import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { tabsEmits, tabsProps } from './type';
import { defineIcon } from '../icon/Icon';
import { TransitionGroup, computed, ref, watchEffect } from 'vue';
import { useNamespace } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';
import { isArray } from '@lun/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { useSetupEvent } from '@lun/core';

const name = 'tabs';
const parts = ['root', 'nav', 'content', 'wrapper', 'panel', 'tab'] as const;
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
    let controlled = false;

    const tabs = computed(() =>
      isArray(props.items)
        ? props.items
            .map((t, i) => {
              const slot = String(t.slot ?? i);
              return {
                ...t,
                slot,
                onClick: () => {
                  if (!t.disabled) {
                    emit('update', slot);
                    if (!controlled) {
                      localActive.value = slot;
                      showedKeys.add(slot);
                    }
                  }
                },
              };
            })
            .filter(Boolean)
        : [],
    );
    watchEffect(() => {
      const { activeSlot, defaultActiveSlot } = props;
      if ((controlled = activeSlot != null)) localActive.value = activeSlot;
      else if (defaultActiveSlot != null) localActive.value = defaultActiveSlot;
      else localActive.value = tabs.value[0]?.slot ?? '0';
      showedKeys.add(localActive.value);
    });
    return () => {
      const { destroyInactive, forceRender } = props;
      const transitionAttrs = {
        tag: 'div',
        class: ns.e('content'),
        part: compParts[1],
      };
      return (
        <div class={ns.t} part={compParts[0]}>
          <div class={ns.e('nav')} part={compParts[1]}>
            <div class={ns.e('wrapper')} part={compParts[3]}>
              {tabs.value.map((t) => (
                <div class={[ns.e('tab'), ns.is('disabled', t.disabled)]} part={compParts[5]} onClick={t.onClick}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
          <TransitionGroup {...getTransitionProps(props, 'panel', 'panel')} {...transitionAttrs}>
            {tabs.value
              .map((t, i) => {
                const active = localActive.value === t.slot;
                return (
                  (active ||
                    (t.forceRender ?? forceRender) ||
                    (showedKeys.has(t.slot) && !(t.destroyInactive ?? destroyInactive))) && (
                    <div key={t.slot ?? i} class={ns.e('panel')} part={compParts[4]} v-show={active}>
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

export const defineTabs = createDefineElement(name, Tabs, {}, parts, {
  icon: defineIcon,
});
