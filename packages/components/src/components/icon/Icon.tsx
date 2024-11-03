import { defineSSRCustomElement } from 'custom';
import { VNode, isVNode, onUnmounted, shallowReactive, watchEffect } from 'vue';
import { GlobalStaticConfig, useContextConfig } from 'config';
import { createDefineElement, error } from 'utils';
import { iconProps } from './type';
import { isFunction, isString } from '@lun-web/utils';
import { getCompParts } from 'common';

export const iconResolveCache = new Map<string, { type: string; src: string }>();
const renderedIconNumMap = new Map<string, number>();

const name = 'icon';
const parts = ['svg'] as const;
const compParts = getCompParts(name, parts);
export const Icon = defineSSRCustomElement({
  name,
  props: iconProps,
  inheritAttrs: false,
  setup(props, { attrs }) {
    const config = useContextConfig();
    const state = shallowReactive({
      type: '',
      src: '' as string | VNode,
    });
    let prevName: string, prevLibrary: string;
    watchEffect(async () => {
      const { library, name } = props;
      const libraryOption = config.iconRegistry[library!];
      if (!library || !name || !libraryOption) return;
      const key = `${library}.${name}`,
        cache = iconResolveCache.get(key);
      if (cache) {
        state.type = cache.type;
        state.src = cache.src;
        return;
      }
      let { type, mutator, resolver } = libraryOption;
      mutator = isFunction(mutator) ? mutator : (i) => i;
      try {
        let result = await resolver(name, attrs);
        if (type === 'html-url' && isString(result)) {
          // if type is `html-url`, do a fetch to get html text
          result = (await GlobalStaticConfig.iconRequest(result))!;
          if (!result) return;
          type = 'html';
        }
        if (props.library !== library || props.name !== name) {
          // if props update after await, ignore this effect
          return;
        }
        result = mutator(result) || result;
        // clear previous
        state.type = '';
        state.src = '';
        switch (type) {
          case 'html':
            if (isString(result)) state.src = result;
            state.type = type;
            break;
          case 'svg-sprite-href':
            if (isString(result)) state.src = result;
            state.type = type;
            break;
          case 'vnode':
            if (isVNode(result)) state.src = result;
            state.type = type;
            break;
        }
        if (isString(state.src)) {
          const prevKey = `${prevLibrary}.${prevName}`;
          const currentNum = renderedIconNumMap.get(key),
            prevNum = renderedIconNumMap.get(prevKey);
          if (prevLibrary !== library && prevName !== name) {
            if (currentNum) renderedIconNumMap.set(key, currentNum + 1);
            else renderedIconNumMap.set(key, 1);
            if (prevLibrary && prevName && prevNum) {
              renderedIconNumMap.set(prevKey, prevNum - 1);
            }
          }
          // vnode cannot be reused, only cache string
          iconResolveCache.set(key, { type: state.type, src: state.src });
          prevName = name;
          prevLibrary = library;
        }
      } catch (e) {
        if (__DEV__) error('An error occurred when updating icon', e);
      }
    });

    onUnmounted(() => {
      const { library, name, autoClearCache } = props;
      if (library && name) {
        const key = `${library}.${name}`,
          currentNum = renderedIconNumMap.get(key);
        if (currentNum) renderedIconNumMap.set(key, currentNum - 1);
        if (autoClearCache && currentNum === 1) {
          renderedIconNumMap.delete(key);
          iconResolveCache.delete(key);
        }
      }
    });
    return () => {
      if (!state.src) return null;
      switch (state.type) {
        case 'vnode':
          return state.src;
        case 'html':
          return (
            <span
              style={{ display: 'contents' }}
              v-html={GlobalStaticConfig.htmlPreprocessor(state.src as string)}
            ></span>
          );
        case 'svg-sprite-href':
          return (
            <svg {...attrs} part={compParts[0]}>
              <use part="use" href={state.src as string}></use>
            </svg>
          );
      }
    };
  },
});

export type tIcon = typeof Icon;
export type IconExpose = {};
export type iIcon = InstanceType<tIcon> & IconExpose;

export const defineIcon = createDefineElement(
  name,
  Icon,
  {
    library: 'default',
  },
  parts,
);
