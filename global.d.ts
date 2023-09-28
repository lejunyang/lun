declare const __DEV__: string;
declare module '*.scss';
declare module '*.scss?inline' {
  const content: string;
  export default content;
}
