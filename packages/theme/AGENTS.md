# `@lun-web/theme` — AGENTS.md

> Default theme for `@lun-web/components`. SCSS sources + a JS bundle that registers styles via the components' style-registry hooks.
> Root guide: [`../../AGENTS.md`](../../AGENTS.md). Chinese: [`AGENTS.zh-CN.md`](./AGENTS.zh-CN.md).

## Layout

```
src/
  index.ts                — re-exports common + components subbarrels
  scss/
    common/
      index.ts            — registers common static + dynamic theme (space, scale)
      index.scss          — common rules consumed by `import ... ?inline`
      color.ts            — color theme registration
      keyframes.scss      — global @keyframes (transition library)
      radius.scss, shadow.scss, theme-colors.scss, transitions.scss, typography.scss
    components/
      <comp>/             — one folder per component (mirrors components/src/components/<comp>)
        index.ts          — runs `createImportStyle(comp, <comp>.scss, [variant])` per file
        <comp>.scss       — base style, uses theme mixins / vars
        <variant>.scss    — optional variant styles (registered with the third arg of createImportStyle)
    mixins/
      bem.scss            — BEM helper (matches GlobalStaticConfig BEM separators)
      config.scss         — namespace / separators / state prefix
      function.scss       — utility SCSS functions
      theme.scss          — theme variable readers
    utils/                — SCSS-side TS helpers (getVarName, getVarValue, getHostStyle)
  custom/                 — entry for `@lun-web/theme/custom` (theme override helpers for end users)
```

Package `exports`:

- `'.'` — JS bundle that runs all `createImportStyle` registrations. Importing this is the side-effect that "installs" the theme.
- `'./custom'` — user-facing theme customisation API.
- `'./scss/common/*.scss'`, `'./scss/components/*'`, `'./scss/mixins/*.scss'` — raw SCSS for projects building their own themes.

## How theme registration works

1. Each component's SCSS file is imported in JS as a string via Vite's `?inline` query.
2. `createImportStyle(componentKey, scssString, variantName?)` (from `@lun-web/components`) is called at module scope. It's `once`-guarded, so multiple imports don't duplicate.
3. The string is pushed into `GlobalStaticConfig.styles[componentKey]`, which custom elements read at `connectedCallback` time and turn into `adoptedStyleSheets` (or `<style>` nodes for components that need per-instance variables).
4. `createImportDynamicStyle(componentKey, (vm, comp, context) => string)` is for styles that depend on the context theme — they re-run when the theme changes.

Example (button):

```ts
// scss/components/button/index.ts
import buttonScss from './button.scss?inline';
import softScss from './soft.scss?inline';
import { createImportStyle } from '@lun-web/components';

export const importButtonStyle = createImportStyle('button', buttonScss);
export const importButtonSoftStyle = createImportStyle('button', softScss, 'soft');
```

## Conventions

| Rule | Why |
|---|---|
| All visual values are CSS custom properties (`--l-button-bg`, `--l-radius-2`, …) | runtime theming, no rebuild |
| Use `@include bem.b('button') { ... }` / `bem.e(...)`/ `bem.m(...)` to build selectors | keeps BEM separators in sync with `GlobalStaticConfig` |
| Use the `theme()` / `getVarValue()` helpers to read theme tokens | reading a hard-coded `--l-...` string breaks when consumers rename namespace |
| One file per logical concern (`size.scss`, `variant-soft.scss`, …); import them through the folder's `index.ts` | tree-shaking + variant opt-in |
| Variant styles register with the third arg of `createImportStyle` | so `GlobalStaticConfig.availableVariants[comp]` knows what's possible |
| Component SCSS targets `:host` for shadow-internal styles, and `::slotted(...)` only when needed | every component runs in its own shadow root |

## Adding a new component's theme

1. Create `scss/components/<comp>/index.ts` and `scss/components/<comp>/<comp>.scss`.
2. In `<comp>.scss`:
   - `@use '../../mixins' as *;`
   - `@include bem.b('<comp>') { ... }` and so on.
   - Pull values from CSS custom properties; reference theme tokens via helpers.
3. In `index.ts`: `export const importXStyle = createImportStyle('<comp>', xScss);`.
4. Add the file path to `scss/components/index.ts` so it ships with the JS bundle.
5. Add variants as separate SCSS files, registered with the third arg.

## Don't

- Don't hard-code colour, radius, font-size, spacing values. Use CSS variables.
- Don't write deep CSS combinators that reach into another component's shadow tree (`l-input l-icon` doesn't work; each is in its own shadow).
- Don't put `@layer` declarations in component SCSS — `GlobalStaticConfig.wrapCSSLayer` handles that wrap globally.
- Don't import a SCSS file from JS without `?inline` (you'll get a CSS file processed as a module, not a string).
- Don't depend on a peer that's not declared. `bezier-easing` and `colorjs.io` are `optionalDependencies` — only the JS code under `custom/` uses them, behind feature checks.
