# `@lun-web/components` — AGENTS.md

> Cross-framework Web Components library. Custom-element ⊕ Shadow DOM, Vue 3 as the authoring runtime.
> Root guide: [`../../AGENTS.md`](../../AGENTS.md). Chinese: [`AGENTS.zh-CN.md`](./AGENTS.zh-CN.md).

## Architecture (read this once before changing anything)

```
src/
  custom/             # forked defineCustomElement, virtual parent linking — DO NOT bypass
  components/<name>/  # one folder per element (Name.tsx + name.define.ts + type.ts [+ helpers])
  components/config/  # GlobalStaticConfig, GlobalContextConfig, comp lists, defaults
  common/             # prop factories, theme/edit-state prop bags, emit helpers, BEM-ish glue
  hooks/              # component-aware hooks (useNamespace, useCEStates, useCEExpose, models, …)
  utils/              # custom-element registration helpers (createDefineElement, renderElement, …)
  types/              # generated .d.ts shims for Vue/React/HTML tag types (build output target)
```

Why each layer exists:

- **`custom/apiCustomElement.ts`** — owns the `defineCustomElement` overload, the `VueElement` class, attribute ⇄ prop reflection, cross-shadow `_findParent`, scoped styles via `adoptedStyleSheets`, the `emit` → `CustomEvent` bridge, and HMR. Any "Vue does X, but the element does Y" question is answered here. **Never** import Vue's own `defineCustomElement`.
- **`components/config/`** — single source of truth for namespace (`l-` by default), BEM separators, default-prop overrides, attribute transformers, event-name styles, breakpoints, math/date presets, and the registry of component keys. `GlobalStaticConfig` is locked-in-at-import-time (mutate before importing components). `GlobalContextConfig` is reactive and per-tree.
- **`components/<name>/`** — the building block. Each folder is self-contained and only imports from `common`, `hooks`, `utils`, `custom`, `config`, `@lun-web/core`, `@lun-web/utils`, sibling components via `../<sibling>`, and `vue`. Never reach into another package's `src/`.
- **`common/propConstructor.ts`** — `PropString`, `PropNumber`, … cached factories that wrap Vue prop-options. Use these, not raw `{ type: String }`.
- **`hooks/`** — component-side hooks that *depend on* the custom-element runtime (namespace, expose, states, models). Framework-agnostic hooks belong in `@lun-web/core`.
- **`utils/`** — registration + style helpers (`createDefineElement`, `renderElement`, `createImportStyle`, `createImportDynamicStyle`).

## Adding a component (mechanical checklist)

1. Pick the most similar existing folder and copy it (`button` for "thin wrapper around a native element", `dialog` / `popover` for "managed open state", `select` / `tree` for "collector parent + children").
2. Create:
   - `<Name>.tsx` — exports `<Name>` (the element class), `<Name>Expose`, `t<Name>`, `i<Name>`, `define<Name>`. End with `createDefineElement(name, <Name>, defaults, parts, [dependencyDefines])`.
   - `<name>.define.ts` — exactly two lines: import + `define<Name>()` call. This is what `import '@lun-web/components/define/<name>'` resolves to.
   - `type.ts` — `<name>Props` (frozen), `<name>Emits` (via `createEmits`), `<Name>SetupProps`, `<Name>EventProps`, `<Name>EventMap`, `<Name>Props`.
   - `index.ts` — `export * from './<Name>'; export * from './type';`
3. Append the kebab key to the right list in `components/config/utils.ts`:
   - `openShadowComponents` — default
   - `closedShadowComponents` — for elements that should hide implementation (`watermark`)
   - `noShadowComponents` — for renderer-only elements (`custom-renderer`, `virtual-renderer`)
4. Add `define<Name>` to `defineAllComponents()` in `components/index.ts` **in dependency order** (providers first — search the existing array for placement).
5. Add the SCSS in `packages/theme/src/scss/components/<name>/` and register it in that folder's `index.ts` via `createImportStyle(name, scssString)`.
6. Add a doc page under `src/docs/components/<name>/`.
7. Add a real-browser test in `__tests__/components/<Name>.test.tsx` if behaviour warrants — at minimum cover the unique invariants of your component (interactive + disabled gating, model updates, exposed methods).

## Patterns to copy, anti-patterns to avoid

| ✔ Do | ✘ Don't |
|---|---|
| `const ns = useNamespace(name)`, then `ns.b/e/m/be/em/bm/bem/is/isOr/v/vn` | hand-build `'l-button__inner'` strings |
| `const [stateClass, states] = useCEStates(() => ({ checked, loading }))` | toggle classes manually based on `props.*` |
| `const [editComputed, editState] = useSetupEdit()` and gate on `editComputed.interactive` / `.editable` | read `props.disabled` / `props.loading` directly |
| `useValueModel(props)` / `useOpenModel(props)` / `useCheckedModel(props)` | hand-roll `watch(() => props.value, ...)` + `emit('update', ...)` |
| `useCEExpose({ method() {...}, get readonly_value() {...} })` | assign to `vm.exposed` directly |
| `interceptCEMethods(innerInputRef)` when delegating `focus/blur/click` | rely on default behaviour (custom element won't focus the inner native) |
| `renderElement('icon', { name: 'x' })` | `<l-icon name="x" />` (hard-codes the namespace) |
| `freeze(props)` and `freeze(emits)` (via `createEmits`) | mutable prop / emit objects |
| `parts = ['root', ...] as const; compParts = getCompParts(name, parts); part={compParts[0]}` — every shadow-root element gets a `part`, including `<input>` / wrappers / icons; pass the same `parts` to `createDefineElement` so `exportparts` is auto-wired | repeat the part string per call site; ship a shadow node without a `part` (consumers can't `::part()` style it, and dependency `exportparts` chains break) |
| When you already apply `stateClass` (the value returned by `useCEStates`), let it carry the block class — `stateClass` is `[ns.t, ns.is(states)]` and `ns.t` already includes `ns.b()` + size/variant/color theme classes. **`useCEStates` reads the namespace via `useDefinedNameSpace()`, so you still must call `useNamespace(name)` once in setup** even if you don't use its return value (see `AccordionGroup.tsx`) | `class={[stateClass.value, ns.b()]}` — `ns.b()` ends up duplicated; or skipping `useNamespace(name)` entirely — `stateClass.value` will be `''` |
| Put defaults in `createDefineElement(name, Comp, { defaults }, ...)` | put `default:` inside the prop option |
| Use `undefBoolProp` for tri-state booleans (`open`, `disabled`, …) | rely on Vue's default `false` for booleans (it breaks inherit chains) |
| `createEmits<{ event: Payload | undefined }>(['event'])` — type + runtime list both required | array-only emits (no type info) or type-only (Vue won't see it) |

## TSDoc convention for component props

Each prop in a frozen `<comp>Props` object is documented with a TSDoc block immediately above it. The docs site reads these blocks at build time (`src/docs/.vitepress/docProcess/injectPropsTable.ts`) and renders the "组件属性 / Props" table at the bottom of every component page. Anything off the convention is silently skipped.

Recognised tags:

| Tag | Required? | Meaning |
|---|---|---|
| `@locale.zh-CN <text>` | yes (zh) | Chinese description. Authoring language of this project. |
| `@locale.en <text>` | strongly recommended | English description. Falls back to `@locale.zh-CN` when missing. |
| `@default <expr>` | when there is a default | Display value for the "默认值" column. Plain text — write it the way users would type it (`true`, `'start'`, `4`, `/[\s,]/`). |
| `@type <text>` | rarely | Override the auto-derived display type. Use when the inferred string is unreadable (deep generics, long unions). Keep it short. |
| `@internal` | when applicable | Mark the prop as internal — excluded from the docs table. |

Layout rules:

- Untagged free text in the block is treated as `@locale.zh-CN` content. Don't mix free text with `@locale.zh-CN` — pick one. (The skill writes the tagged form.)
- Each tag is one logical line. A tag's text ends at the next `@tag` or the end of the block. Multiline descriptions are allowed; line breaks become spaces in the table.
- Description text is **prose**, not Markdown — no inline code spans, no link syntax. Keep it short (one sentence ideal, two max).
- `@default` is **the single source of truth for defaults shown in the docs**. The skill discovers defaults from `createDefineElement(..., { ... })`, in-setup destructuring fallbacks (`const { x = 'y' } = props`), and shared bags (`undefBoolProp`, `valueProp`), and writes them into `@default`. If a default later changes in code, re-run the skill.

Example:

```ts
export const filePickerProps = freeze({
  ...editStateProps,
  /**
   * @locale.zh-CN 移动端提示操作系统直接打开拍摄/录音设备而非文件选择器，映射到原生 input 的 capture 属性
   * @locale.en Mobile-only hint asking the OS to open a capture device directly instead of the file picker. Maps to native input `capture`.
   */
  capture: PropBoolOrStr<'user' | 'environment' | boolean>(),
  /**
   * @locale.zh-CN 优先使用 showOpenFilePicker，不支持时回退到 input
   * @locale.en Prefer showOpenFilePicker; fall back to input where unsupported.
   * @default true
   */
  preferFileApi: PropBoolean(),
  /** @internal */
  _bridgeOnly: PropBoolean(),
});
```

Spread bags (`...editStateProps`, `...themeProps`, `...createTransitionProps(...)`, `...createOptionProps(...)`, sibling `<comp>Props`) are resolved automatically — the table shows their props under a collapsible "继承的通用属性" section. Don't duplicate their tsdoc into the consumer component.

To regenerate or update tsdoc across one or more components, invoke the **`component-tsdoc`** skill — it scans `type.ts`, probes defaults, and preserves any human-written descriptions.

## Common subsystems

### `useSetupEdit`

Lives in `@lun-web/core`. Returns `[editComputed, editState]`. Inherits via Vue provide/inject across shadow boundaries (powered by `apiCustomElement`'s custom parent lookup). `editComputed.interactive` is `!disabled && !loading`; `editComputed.editable` adds `&& !readonly`. `editState` lets you locally set `loading` etc. during async work.

### `useNamespace`

Returns BEM helpers + theme glue. Also wires the component into the theme inheritance chain (parent custom-element discovery via `getVmParent` / `setVmParent`). Calling it is **required** for theme classes (`ns.t`) and exposed `size` / `isDark` to work.

### Collectors (parent / children registry)

Defined in `@lun-web/core/src/composable/createCollector.ts`. Components that have parent-child relationships (form, select, tabs, tree, table, accordion, radio-group, checkbox-group) **must** use a collector — it handles DOM-order children, cross-shadow lookup, sort, dynamic add/remove, and provides `state.parentMounted` for SSR. The collector's `getParentEl` / `getChildEl` are pre-wired to `vmToCE` in `common/index.ts` via `getCollectorOptions(name, sort?, skipInternalChildren?, onlyForProp?)`.

### Style registration

```ts
// once-guarded; safe to call from module scope:
export const importButtonStyle = createImportStyle('button', buttonScss);
export const importDynamicButton = createImportDynamicStyle('button', (vm, comp, context) => `:host { ... }`);
```

Static styles produce `adoptedStyleSheets` per element. Dynamic styles re-run when context theme changes. Variants register via `createImportStyle(comp, scss, variantName)`.

### `formAssociated`

Set `formAssociated: true` in `defineCustomElement` options when the component participates in a `<form>`. `apiCustomElement` calls `attachInternals()` and exposes `_internals` on the element. Combine with `useValueModel` and the form-item collector for full form integration.

### Transitions

Use `getTransitionProps(props, 'remove', 'scaleOut')`. `addHandlersIfHeight` automatically wires `height` transitions through Web Animations API (or `calc-size(auto, size)` where supported) — don't write per-component height animations.

## Tests

- Real browser via Playwright. Mount with the global `l(tag, props, options)` helper from `utils/testSetup.ts`.
- Always assert on shadow content via `el.shadowRoot!.querySelector(...)`, not light DOM.
- `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync` work, but be careful: real layout doesn't pause. For animation-driven assertions wait on actual frames (`raf`) rather than synthesising time.
- Components are torn down `afterEach` automatically (except those marked `data-persist`).

## Gotchas (drawn from comments in the code)

- Vue 3.5 changed boolean attribute reflection: `true` is **not** serialised to the data attribute. Stringify before passing to `data-*` (`String(value)`).
- `nextTick` after `disconnectedCallback`: the element may have just been moved within the same parent; we check `_connected` before unmounting.
- `parentNode` of a `ShadowRoot` is `null`; the cross-shadow walk uses `host` and `assignedSlot` instead.
- The `name` of `defineCustomElement` matches a `ComponentKey` — it's how `preprocessComponentOptions` finds your defaults / styles / event-init-map.
- Avoid `import * from '../utils'` in `custom/` — see comment in `apiCustomElement.ts` about the circular-dep on `useSlots → VueCustomRenderer`.

## When in doubt

- Searching the codebase for an existing usage almost always wins over guessing.
- For Vue-side mechanics, the upstream `defineCustomElement` source is illuminating but **not authoritative here** — our fork has diverged.
- For Web Components mechanics (CustomStateSet, ElementInternals, declarative shadow DOM), MDN is the source of truth; the polyfill/fallback paths in `apiCustomElement.ts` are the project's stance.
