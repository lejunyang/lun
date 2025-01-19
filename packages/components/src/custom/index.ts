import { EmitFn, HTMLAttributes, PublicProps } from 'vue';

export * from './apiCustomElement';

// for below refer to https://vuejs.org/guide/extras/web-components.html#non-vue-web-components-and-typescript

type EventMap = {
  [event: string]: Event;
};

// This maps an EventMap to the format that Vue's $emit type expects.
type VueEmit<T extends EventMap> = EmitFn<{
  [K in keyof T]: (event: T[K]) => void;
}>;

/** This is to create element's type for vue template */
export type DefineVueCustomElement<
  ElementType extends HTMLElement,
  Events extends EventMap = {},
  SelectedAttributes extends keyof ElementType = keyof ElementType,
> = new () => ElementType & {
  // Use $props to define the properties exposed to template type checking. Vue
  // specifically reads prop definitions from the `$props` type. Note that we
  // combine the element's props with the global HTML props and Vue's special
  // props.
  /** @deprecated Do not use the $props property on a Custom Element ref, this is for template prop types only. */
  $props: HTMLAttributes & Partial<Pick<ElementType, SelectedAttributes>> & PublicProps;

  // Use $emit to specifically define event types. Vue specifically reads event
  // types from the `$emit` type. Note that `$emit` expects a particular format
  // that we map `Events` to.
  /** @deprecated Do not use the $emit property on a Custom Element ref, this is for template prop types only. */
  $emit: VueEmit<Events>;
};
