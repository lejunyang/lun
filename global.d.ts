/// <reference types="vite/client" />
/// <reference types="vitest" />

declare const __DEV__: string;
declare module '*.scss';
declare module '*.scss?inline' {
  const content: string;
  export default content;
}

declare const l: <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props?: Record<string, any> &
    Record<`on${string}`, (e: Event) => void> & {
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
) => HTMLElementTagNameMap[K];
