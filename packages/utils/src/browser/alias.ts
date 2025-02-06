import { ensureArray } from '../array';
import { isArray } from '../is';
import { on } from './event';
import { setStyle } from './style';
import { uncapitalize } from '../string';

// freeze but don't add readonly type, it's for component's instance element. if's readonly, ts will report error if we modify the props
export const freeze = <T>(o: T) => Object.freeze(o) as T;

export const identity = <T>(x: T) => x;

export const getRect = (elOrRange: Element | Range | { getBoundingClientRect(): DOMRect }) =>
  elOrRange.getBoundingClientRect();

export const isConnected = (el?: Element | null): el is Element => el?.isConnected as boolean;

/** create an element like document.createElement, assign props(or add attributes) to it if provided */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props?: Record<string, any> &
    Record<`on${string}`, <T extends Event>(e: T) => void> & {
      children?: (
        | [
            tagName: keyof HTMLElementTagNameMap,
            props?: Record<string, any> & Record<`on${string}`, (e: Event) => void>,
            options?: { skipFalsyValue?: boolean },
          ]
        | keyof HTMLElementTagNameMap
      )[];
    },
  options?: { skipFalsyValue?: boolean },
): HTMLElementTagNameMap[K] {
  const dom = document.createElement(tagName);
  if (props)
    for (const [key, value] of Object.entries(props)) {
      if (options?.skipFalsyValue && !value) continue;
      if (key === 'style') setStyle(dom, value);
      else if (key === 'class') dom.className = value as string;
      else if (key === 'children') {
        dom.append(
          // @ts-ignore
          ...ensureArray(value).map((i) => (isArray(i) ? createElement(i[0], i[1], i[2]) : createElement(i))),
        );
      } else if (key in dom) (dom as any)[key] = value;
      else if (key.startsWith('on')) {
        on(dom, uncapitalize(key.slice(2)), value);
      } else dom.setAttribute(key, value as string);
    }
  return dom;
}
