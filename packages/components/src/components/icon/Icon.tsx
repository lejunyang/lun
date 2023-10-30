import { defineSSRCustomElement } from 'custom';
import { VNode, isVNode, onUnmounted, shallowReactive, watchEffect } from 'vue';
import { GlobalStaticConfig, useContextConfig } from 'config';
import { createDefineElement, createImportStyle, error } from 'utils';
import { iconProps } from './type';
import styles from './basic.scss?inline';

export const iconResolveCache = new Map<string, { type: string; src: string }>();
const renderedIconNumMap = new Map<string, number>();

const name = 'icon';
export const Icon = defineSSRCustomElement({
  name,
  props: iconProps,
  setup(props) {
    const config = useContextConfig();
    const state = shallowReactive({
      type: '',
      src: '' as string | VNode,
    });
    let prevName: string, prevLibrary: string;
    watchEffect(async () => {
      const { library, name } = props;
      const libraryOption = config.iconRegistryMap[props.library!];
      if (!library || !name || !libraryOption) return;
      const cache = iconResolveCache.get(`${library}.${name}`);
      if (cache) {
        state.type = cache.type;
        state.src = cache.src;
        return;
      }
      let { type, mutator, resolver } = libraryOption;
      mutator = mutator instanceof Function ? mutator : (i) => i;
      try {
        let result = await resolver(name);
        if (type === 'html-url' && typeof result === 'string') {
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
            if (typeof result === 'string') state.src = result;
            state.type = type;
            break;
          case 'svg-sprite-href':
            if (typeof result === 'string') state.src = result;
            state.type = type;
            break;
          case 'vnode':
            if (isVNode(result)) state.src = result;
            state.type = 'vnode';
            break;
        }
        if (state.src && typeof state.src === 'string') {
          const key = `${library}.${name}`,
            prevKey = `${prevLibrary}.${prevName}`;
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
      if (props.library && props.name) {
        const key = `${props.library}.${props.name}`;
        const currentNum = renderedIconNumMap.get(key);
        if (currentNum) renderedIconNumMap.set(key, currentNum - 1);
        if (props.autoClearCache && currentNum === 1) {
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
              v-html={GlobalStaticConfig.vHtmlPreprocessor(state.src as string)}
            ></span>
          );
        case 'svg-sprite-href':
          return (
            <svg part="svg">
              <use part="use" href={state.src as string}></use>
            </svg>
          );
      }
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LIcon: typeof Icon;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-icon': typeof Icon;
  }
}

export const defineIcon = createDefineElement(name, Icon);
export const importIconStyle = createImportStyle(name, styles);