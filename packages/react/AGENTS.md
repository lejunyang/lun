# `@lun-web/react` — AGENTS.md

> Thin React wrappers around `@lun-web/components` custom elements. Two parallel builds: React <19 (legacy) and React 19 (native custom element support).
> Root guide: [`../../AGENTS.md`](../../AGENTS.md). Chinese: [`AGENTS.zh-CN.md`](./AGENTS.zh-CN.md).

## Layout

```
src/
  createComponent.ts     — factory used by legacy (React <19) wrappers
  createComponent19.ts   — factory used by React 19 wrappers (much thinner)
  components/            — legacy wrappers, one file per element (`Button.ts` re-exports the .tsx)
  components19/          — React 19 wrappers, same set of components, simpler bodies
  hooks/                 — React hooks that mirror useful core hooks
  utils/                 — small React-side helpers
postinstall.cjs          — at install time, picks which entry to expose based on installed React version
```

Two parallel dist trees are built (`build:dev` / `build:prod` for legacy, `build19:dev` / `build19:prod` for React 19) and the right one is symlinked / exposed by `postinstall.cjs`.

## Legacy wrapper (`createComponent`)

For React <19, custom elements don't get native support for property assignment or event handling. `createComponent` reproduces that manually:

- Uses `forwardRef` + `useImperativeHandle` to expose the underlying element.
- Walks `reactProps`, classifies each key as: known event (matches `on<Capitalized>` from `emits`), known prop (matches `props` keys or `openShadowCommonProps`), or pass-through (becomes a real attribute on the host).
- Uses `useLayoutEffect` to write properties onto the element imperatively (React would serialise them to strings otherwise) and to attach/detach event listeners.
- Tracks the previous render's prop keys via `useRef` so removed keys get "unset" on next render.

A wrapper file is one line of work:

```ts
// components/Foo.ts
import { fooEmits, fooProps, defineFoo, FooProps, iFoo } from '@lun-web/components';
import createComponent from '../createComponent';
export const LFoo = createComponent<FooProps, iFoo>('foo', defineFoo, fooProps, fooEmits);
if (__DEV__) LFoo.displayName = 'LFoo';
```

## React 19 wrapper (`createComponent19`)

React 19 natively forwards unknown props as element attributes/properties and respects custom event listeners. The wrapper is therefore much thinner — it just calls the `defineFoo` side-effect (to register the custom element) and renders the JSX tag. The same export shape (`LFoo`) is kept so consumers don't see the difference.

## Hard rules

- **No per-component logic in wrappers.** A wrapper file is one line + `displayName`. If you find yourself adding logic, push it into the underlying custom element.
- **Both legacy and React 19 wrappers must exist** for every component in `@lun-web/components`. Keep them in sync (same name, same generic args).
- **React + Vue + custom element** is a three-way dependency. Don't add anything that pulls in React server-side internals.
- **`postinstall.cjs` is part of the API.** Don't break it — it decides which build a consumer actually uses.

## Adding a wrapper for a new component

1. Confirm the component exists in `@lun-web/components` (`define<Name>`, `<Name>Props`, `i<Name>`).
2. Create `src/components/<Name>.tsx` (legacy) — one line of `createComponent<Props, Instance>(name, defineFn, props, emits)`.
3. Create `src/components19/<Name>.tsx` — one line of `createComponent<Props, Instance>(name, defineFn)`.
4. Export `L<Name>` from `index.ts`.
5. The test under `__tests__/` can mirror one of the components tests (mount with `vitest-browser-react`, assert through the React component, also verify the element actually mounted in the DOM).

## Don't

- Don't bypass `createComponent` / `createComponent19`. The whole point is uniform property/event semantics.
- Don't add a "wrapper" feature (custom prop, custom event) that's not in the underlying element — it'll diverge from Vue / vanilla users.
- Don't add a hook here that already lives in `@lun-web/core`. If you need a React-flavoured version, **wrap** the core one rather than re-implementing.
- Don't `import` React types from version-specific paths. Use the `@types/react` entry; legacy quirks are handled at build time.
