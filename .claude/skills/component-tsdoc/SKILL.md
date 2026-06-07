---
name: component-tsdoc
description: Generate or refresh TSDoc blocks above every prop in a Lun component's type.ts so the docs site's "组件属性 / Props" table renders correctly. Handles multi-locale descriptions (zh-CN required, en strongly recommended), discovers defaults from createDefineElement / setup destructuring, marks @internal where appropriate, and preserves human-authored descriptions.
---

# component-tsdoc skill

## When to use

- A component has new props that have no TSDoc, and you need the docs table to show meaningful info.
- A prop's default value changed in `createDefineElement(...)` and the `@default` tag in `type.ts` is now stale.
- The user asks: "为 xxx 组件补全 props tsdoc" / "update tsdoc for select" / "generate prop docs for these components".

## Inputs

Take the kebab-case component names from the user (e.g. `file-picker`, `select`). If they don't give names, list `packages/components/src/components/*/type.ts` and ask which to process.

## Authoritative rules (from `packages/components/AGENTS.md`)

Each prop block must use exactly these tags:

| Tag | Required | Notes |
|---|---|---|
| `@locale.zh-CN` | yes | Chinese prose, one short sentence ideally. **Project authoring language.** |
| `@locale.en` | recommended | English prose. Skip only if you genuinely cannot determine the prop's meaning. |
| `@default` | when applicable | Raw expression as users would write it (`true`, `'start'`, `4`, `/[\s,]/`). |
| `@type` | rarely | Only when the auto-derived type from PropXxx is unreadable. |
| `@internal` | when applicable | Prop is excluded from the docs table. Use for `_*`-prefixed or framework-bridge props. |

DO NOT write `@param`, `@returns`, `@example`, or other tags — they're ignored by the docs hook.

## Procedure

For each component the user asked about:

### 1. Read the source of truth

Read these in parallel:
- `packages/components/src/components/<name>/type.ts` — the frozen props object.
- `packages/components/src/components/<name>/<Name>.tsx` — for the `createDefineElement(name, Comp, defaults, ...)` literal and for `setup()` body's destructuring fallbacks (`const { x = 'y' } = props`).
- Any sibling `.tsx` in the same folder (some components split renderers into multiple files; each may declare its own setup defaults).
- The existing CN doc page at `src/docs/components/<name>/index.md` and (if it exists) `src/docs/en/components/<name>/index.md` — they often already explain what each prop does in prose. Mine that for description text. Don't invent meaning.

### 2. Discover defaults (priority order)

When the same key appears in more than one source, use the FIRST hit in this list:

1. Existing `@default` tag in `type.ts` — keep it. Don't overwrite human-curated defaults silently. If you have strong reason to believe it's wrong (the value mismatches `createDefineElement`), surface it as a warning to the user, don't silently mutate.
2. `createDefineElement(name, Comp, { … }, parts, [deps])` — the third argument literal at the bottom of `<Name>.tsx`. Copy the value text verbatim.
3. `const { foo = 'bar' } = props` style destructuring inside any function body in the component folder. Verbatim.
4. `props.foo ?? 'bar'` / `props.foo || 'bar'` — record but flag as "fallback, not a true default" in your reasoning; only write to `@default` if there's no other source AND the expression is a literal (not a runtime call).
5. `undefBoolProp` / `valueProp` shared constants — these carry `default: undefined`. Do NOT emit `@default undefined`; the user already understands undefined means "no default."

If after all sources the prop has no concrete default, omit `@default` entirely.

### 3. Determine internal-ness

Mark `@internal` when ANY of:
- The prop name starts with `_`.
- The existing tsdoc had `@internal`.
- The user explicitly says so.
- A comment in the source clearly labels it as internal.

`@internal` props are excluded from the docs table — that's the entire point.

### 4. Write or preserve descriptions

- Existing `@locale.zh-CN` / `@locale.en` content is sacred — copy it verbatim into the new block.
- Existing UNTAGGED free text in the tsdoc block was the previous convention. Promote it to `@locale.zh-CN` verbatim, unless it's clearly English (then use `@locale.en` and ask the user whether to add zh).
- For props with NO existing description: write one short sentence (one ideal, two max) for zh-CN. Source the meaning from: the doc page's section about that prop, the prop's usage in `<Name>.tsx`, the existing English doc if any. Don't make things up — if you can't tell what a prop does, ask the user rather than guess.
- For English: translate the zh-CN sentence to natural English. Keep it short. Don't transliterate.
- Prose only — NO inline backticks, NO links, NO Markdown. The hook serialises this into a table cell.

### 5. Spread bags

Lines like `...editStateProps`, `...themeProps`, `...createTransitionProps('...')`, `...calendarProps` (sibling component's props) should be LEFT ALONE. The docs hook resolves them automatically into the "继承的通用属性" collapsible section — don't expand them into the consumer's tsdoc.

### 6. Write the file

Use the Edit tool. Preserve the existing import block, the `freeze(` wrapper, and emit/event/type exports verbatim — change ONLY the per-prop comment blocks.

Each block is a multi-line `/** … */` placed immediately above the prop, indented to match the prop. Format:

```ts
  /**
   * @locale.zh-CN <中文描述>
   * @locale.en <English description>
   * @default <value>      // only when applicable
   */
  propName: PropXxx(),
```

For `@internal`-only blocks, the short form is fine:

```ts
  /** @internal */
  _bridgeOnly: PropBoolean(),
```

### 7. After all components are done

- Report a per-component summary: how many props got new descriptions, how many already had them, any defaults that disagreed between sources (and which you chose), any props you couldn't describe (and need user input on).
- Recommend the user start the dev server (`pnpm dev`) and visit the component pages to verify the rendered table.
- Do not commit. The user decides when to commit.

## Anti-patterns to avoid

- ❌ Wrapping the prop description in backticks or formatting it as Markdown.
- ❌ Adding `@default undefined` — semantically noise.
- ❌ Inventing English descriptions just to fill the slot. If the meaning is unclear, ask.
- ❌ Removing the `@internal` tag from props that had it.
- ❌ Touching props in spread bags' source files (e.g. don't edit `editStateProps.ts` from this skill — those have hard-coded descriptions in the extractor on the docs side).
- ❌ Reformatting unrelated code in `type.ts` (imports, emits, type exports). Only touch the property comments.

## Verification after running

For each touched component, mentally check (or actually look at):
1. Run `node -e "import('./src/docs/.vitepress/extractComponentProps.ts').then(m => console.log(JSON.stringify(m.extractComponentProps('<name>'), null, 2)))"` — confirm every own-prop has at minimum `desc['zh-CN']` set and that defaults match `createDefineElement`.
2. If the component has many props or unusual factory shapes, also start `pnpm dev` and visit `/components/<name>/` to confirm the table renders.
