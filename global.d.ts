/// <reference types="vite/client" />
/// <reference types="vitest" />

declare const __DEV__: string;
declare module '*.scss';
declare module '*.scss?inline' {
  const content: string;
  export default content;
}

type Fn = () => void;
type AnyFn = (...args: any[]) => any;

type EnsureParameters<T> = T extends (...args: infer P) => any ? P : never[];
