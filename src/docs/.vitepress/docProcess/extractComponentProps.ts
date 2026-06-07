import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export type Locale = 'zh-CN' | 'en';

export interface ExtractedProp {
  /** prop name */
  name: string;
  /** raw factory call text, e.g. `PropBoolOrStr<'user' | 'environment' | boolean>()` */
  factory: string;
  /** display type string */
  type: string;
  /** default value text, undefined if none */
  default?: string;
  /** prose description per locale */
  desc: Partial<Record<Locale, string>>;
  internal?: boolean;
}

export interface ExtractedGroup {
  /** logical group key — 'own' for component's own props; otherwise the spread label */
  label: string;
  /** displayed label per locale */
  displayLabel: Partial<Record<Locale, string>>;
  props: ExtractedProp[];
}

export interface ExtractResult {
  componentName: string;
  groups: ExtractedGroup[];
  /** Sibling custom elements declared in the same folder (e.g. `checkbox-group` for `checkbox`).
   * Empty for components that have no related sub/parent elements. */
  related?: ExtractResult[];
}

interface FactoryToTypeOptions {
  /** runtime-arg constructors passed to PropString(RegExp) etc — turn into ` | RegExp` text */
  runtimeArgs: string[];
}

/** Map a prop-factory call to a display type string, given its generic args (text only) and runtime args. */
function factoryToType(factory: string, generic: string | undefined, opts: FactoryToTypeOptions): string {
  // Strip leading factory name
  const m = factory.match(/^([A-Za-z_$][\w$]*)/);
  if (!m) return generic || 'unknown';
  const name = m[1];
  const runtimeExtra = opts.runtimeArgs
    .map((r) => primitiveCtorToType(r))
    .filter(Boolean)
    .join(' | ');
  const compose = (base: string) => (runtimeExtra ? `${base} | ${runtimeExtra}` : base);

  if (generic) {
    // generic supplied — trust it, but Prop<T>() returns exactly T, others union with their base
    if (name === 'Prop') return generic;
    if (name === 'PropResponsive') return `Responsive<${generic}>`;
    return compose(generic);
  }

  switch (name) {
    case 'PropString':
      return compose('string');
    case 'PropNumber':
      return compose('number');
    case 'PropBoolean':
      return compose('boolean');
    case 'PropBoolOrStr':
      return compose('boolean | string');
    case 'PropBoolOrFunc':
      return compose('boolean | Function');
    case 'PropObject':
      return compose('object');
    case 'PropArray':
      return compose('any[]');
    case 'PropSet':
      return compose('Set | any[]');
    case 'PropFunction':
      return compose('Function');
    case 'PropObjOrFunc':
      return compose('object | Function');
    case 'PropObjOrStr':
      return compose('object | string');
    case 'PropObjOrBool':
      return compose('boolean | object');
    case 'PropStrOrArr':
      return compose('string | string[]');
    case 'PropNumOrArr':
      return compose('string | number | (string | number)[]');
    case 'PropStrOrFunc':
      return compose('string | Function');
    case 'PropNumOrFunc':
      return compose('string | number | Function');
    case 'PropResponsive':
      return 'Responsive<any>';
    case 'Prop':
      return 'unknown';
    case 'undefBoolProp':
      return 'boolean';
    case 'valueProp':
      return 'boolean | string | object | number';
    case 'sizeProp':
      return 'Responsive<string | number>';
    case 'transitionProp':
      return 'string | TransitionProps';
    default:
      return name;
  }
}

function primitiveCtorToType(ctor: string): string {
  switch (ctor) {
    case 'String':
      return 'string';
    case 'Number':
      return 'number';
    case 'Boolean':
      return 'boolean';
    case 'RegExp':
      return 'RegExp';
    case 'Object':
      return 'object';
    case 'Array':
      return 'any[]';
    case 'Function':
      return 'Function';
    default:
      return ctor;
  }
}

/** Parse a TSDoc block (the text between /** and *​/) into per-tag fields. */
function parseTsdoc(raw: string): {
  desc: Partial<Record<Locale, string>>;
  default?: string;
  type?: string;
  internal?: boolean;
} {
  // Normalise: drop leading * on each line
  const lines = raw.split(/\r?\n/).map((l) => l.replace(/^\s*\*\s?/, '').trimEnd());
  // Coalesce lines into "tagged segments". The first segment may be untagged (free text).
  type Seg = { tag: string; text: string };
  const segs: Seg[] = [];
  let current: Seg = { tag: '', text: '' };
  for (const line of lines) {
    const tagMatch = line.match(/^@([\w.-]+)\s*(.*)$/);
    if (tagMatch) {
      if (current.tag || current.text.trim()) segs.push(current);
      current = { tag: tagMatch[1], text: tagMatch[2] };
    } else {
      current.text = (current.text + (current.text ? ' ' : '') + line).trim();
    }
  }
  if (current.tag || current.text.trim()) segs.push(current);

  const out: ReturnType<typeof parseTsdoc> = { desc: {} };
  for (const s of segs) {
    const text = s.text.trim();
    if (!s.tag) {
      // untagged free text — treat as zh-CN
      if (text) out.desc['zh-CN'] = text;
    } else if (s.tag === 'locale.zh-CN') {
      out.desc['zh-CN'] = text;
    } else if (s.tag === 'locale.en') {
      out.desc['en'] = text;
    } else if (s.tag === 'default') {
      out.default = text;
    } else if (s.tag === 'type') {
      out.type = text;
    } else if (s.tag === 'internal') {
      out.internal = true;
    }
    // unknown tags ignored
  }
  return out;
}

/** Extract the TSDoc /** ... *​/ block immediately preceding `pos` in `source`. */
function getLeadingTsdoc(source: string, pos: number): string | undefined {
  const ranges = ts.getLeadingCommentRanges(source, pos);
  if (!ranges) return undefined;
  // Take the last /** ... */ block
  for (let i = ranges.length - 1; i >= 0; i--) {
    const r = ranges[i];
    if (r.kind !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
    const raw = source.slice(r.pos, r.end);
    if (raw.startsWith('/**')) {
      return raw.slice(3, -2);
    }
  }
  return undefined;
}

/** ---- Shared-bag resolution ---- */

/**
 * Find the repo root by walking up from this file until we hit a directory
 * that contains `pnpm-workspace.yaml`. Prefer this over hard-coded relative
 * paths so the extractor keeps working when its source file moves.
 */
function findRepoRoot(): string {
  let dir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('[extractComponentProps] could not locate repo root (pnpm-workspace.yaml)');
}

const REPO_ROOT = findRepoRoot();
const COMMON_DIR = path.join(REPO_ROOT, 'packages/components/src/common');
const COMPONENTS_DIR = path.join(REPO_ROOT, 'packages/components/src/components');

interface CachedBag {
  group: ExtractedGroup;
}
const bagCache = new Map<string, CachedBag | null>();

/** Pretty label per locale for a known shared bag */
const KNOWN_BAG_LABELS: Record<string, Partial<Record<Locale, string>>> = {
  editStateProps: { 'zh-CN': '公共编辑状态属性', en: 'Common Edit-state Props' },
  themeProps: { 'zh-CN': '公共主题属性', en: 'Common Theme Props' },
  openShadowCommonProps: { 'zh-CN': '通用 Shadow Props', en: 'Common Shadow Props' },
};

/** Manually-described bags whose source is too dynamic to AST-parse */
const HARDCODED_BAGS: Record<string, ExtractedProp[]> = {
  editStateProps: [
    {
      name: 'disabled',
      factory: 'undefBoolProp',
      type: 'boolean',
      desc: { 'zh-CN': '禁用，禁用后不可交互', en: 'Disable interaction.' },
    },
    {
      name: 'readonly',
      factory: 'undefBoolProp',
      type: 'boolean',
      desc: { 'zh-CN': '只读，可读但不可编辑', en: 'Read-only.' },
    },
    {
      name: 'loading',
      factory: 'undefBoolProp',
      type: 'boolean',
      desc: { 'zh-CN': '加载中，加载时不可交互', en: 'Loading; blocks interaction.' },
    },
    {
      name: 'mergeDisabled',
      factory: 'undefBoolProp',
      type: 'boolean',
      desc: {
        'zh-CN': '该 disabled 是否与父组件合并继承',
        en: 'Whether `disabled` merges with the parent component.',
      },
    },
    {
      name: 'mergeReadonly',
      factory: 'undefBoolProp',
      type: 'boolean',
      desc: {
        'zh-CN': '该 readonly 是否与父组件合并继承',
        en: 'Whether `readonly` merges with the parent component.',
      },
    },
    {
      name: 'mergeLoading',
      factory: 'undefBoolProp',
      type: 'boolean',
      desc: {
        'zh-CN': '该 loading 是否与父组件合并继承',
        en: 'Whether `loading` merges with the parent component.',
      },
    },
  ],
  themeProps: [
    {
      name: 'size',
      factory: 'PropResponsive',
      type: "Responsive<'1' | '2' | '3' | string>",
      desc: { 'zh-CN': '组件大小，支持响应式断点对象', en: 'Component size; supports responsive object.' },
    },
    {
      name: 'color',
      factory: 'PropString',
      type: 'ThemeColors',
      desc: { 'zh-CN': '主题色', en: 'Theme color.' },
    },
    {
      name: 'status',
      factory: 'PropString',
      type: 'Status',
      desc: {
        'zh-CN': '状态色，如 success / warning / error / info',
        en: 'Status color: success / warning / error / info.',
      },
    },
    {
      name: 'variant',
      factory: 'PropString',
      type: "'solid' | 'soft' | 'surface' | 'outline' | 'classic' | 'ghost'",
      desc: { 'zh-CN': '组件变体', en: 'Variant style.' },
    },
    {
      name: 'radius',
      factory: 'PropString',
      type: "'none' | 'small' | 'medium' | 'large' | 'full'",
      desc: { 'zh-CN': '圆角', en: 'Border radius.' },
    },
    {
      name: 'highContrast',
      factory: 'undefBoolProp',
      type: 'boolean',
      desc: { 'zh-CN': '高对比度模式', en: 'High-contrast mode.' },
    },
    {
      name: 'appearance',
      factory: 'PropString',
      type: "'light' | 'dark'",
      desc: { 'zh-CN': '外观（亮/暗）', en: 'Light or dark appearance.' },
    },
    {
      name: 'scale',
      factory: 'PropNumber',
      type: 'number',
      desc: { 'zh-CN': '缩放比例', en: 'Scale factor.' },
    },
    {
      name: 'grayColor',
      factory: 'PropString',
      type: 'GrayColors',
      desc: { 'zh-CN': '灰阶色板', en: 'Gray-scale palette.' },
    },
  ],
  openShadowCommonProps: [
    {
      name: 'innerStyle',
      factory: 'PropString',
      type: 'string',
      desc: {
        'zh-CN': '附加到 shadow 内根元素的内联样式字符串',
        en: 'Inline style string injected into the shadow root element.',
      },
    },
  ],
};

function resolveBag(bagName: string): CachedBag | null {
  if (bagCache.has(bagName)) return bagCache.get(bagName)!;
  if (HARDCODED_BAGS[bagName]) {
    const group: ExtractedGroup = {
      label: bagName,
      displayLabel: KNOWN_BAG_LABELS[bagName] || { 'zh-CN': bagName, en: bagName },
      props: HARDCODED_BAGS[bagName],
    };
    bagCache.set(bagName, { group });
    return { group };
  }
  bagCache.set(bagName, null);
  return null;
}

/** Resolve a `createXxxProps(...)` function call to an extracted group, best-effort. */
function resolveFactoryBag(callName: string): ExtractedGroup | null {
  if (callName === 'createTransitionProps') {
    return {
      label: 'transition',
      displayLabel: { 'zh-CN': '过渡动画属性', en: 'Transition Props' },
      props: [
        {
          name: 'transition',
          factory: 'transitionProp',
          type: 'string | TransitionProps',
          desc: { 'zh-CN': '过渡动画名称或 TransitionProps 配置', en: 'Transition name or TransitionProps object.' },
        },
      ],
    };
  }
  return null;
}

/** Resolve a spread sibling component props bag, e.g. `...baseInputProps`, `...calendarProps`. */
function resolveSiblingComponentBag(propsName: string): ExtractedGroup | null {
  // Lookup by glob across components/<name>/type.ts for `export const <propsName> = (freeze\()?{`
  const compsRoot = COMPONENTS_DIR;
  if (!fs.existsSync(compsRoot)) return null;
  for (const dir of fs.readdirSync(compsRoot)) {
    const typeFile = path.join(compsRoot, dir, 'type.ts');
    if (!fs.existsSync(typeFile)) continue;
    const src = fs.readFileSync(typeFile, 'utf8');
    if (!new RegExp(`export\\s+const\\s+${propsName}\\s*=`).test(src)) continue;
    const parsed = parsePropsObjectFromSource(src, typeFile, propsName);
    if (!parsed) continue;
    // Flatten into a single group keyed by the bag name
    const allProps: ExtractedProp[] = [];
    for (const g of parsed.groups) allProps.push(...g.props);
    return {
      label: propsName,
      displayLabel: {
        'zh-CN': `继承自 ${propsName}`,
        en: `Inherited from ${propsName}`,
      },
      props: allProps,
    };
  }
  return null;
}

/** Locate a top-level `const <name> = ...` initializer in a source file, accepting both
 * `freeze({ ... })` and bare object literals. Returns the object literal expression. */
function findVarObjectLiteral(sf: ts.SourceFile, varName: string): ts.ObjectLiteralExpression | null {
  let target: ts.ObjectLiteralExpression | null = null;
  sf.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== varName) continue;
      if (!decl.initializer) continue;
      if (ts.isCallExpression(decl.initializer) && decl.initializer.arguments.length) {
        const arg = decl.initializer.arguments[0];
        if (ts.isObjectLiteralExpression(arg)) target = arg;
      } else if (ts.isObjectLiteralExpression(decl.initializer)) {
        target = decl.initializer;
      }
    }
  });
  return target;
}

/** Core: extract a frozen props object out of a source file. */
function parsePropsObjectFromSource(source: string, fileName: string, propsVarName: string): ExtractResult | null {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const target = findVarObjectLiteral(sf, propsVarName);
  if (!target) return null;

  const ownGroup: ExtractedGroup = {
    label: 'own',
    displayLabel: { 'zh-CN': '组件属性', en: 'Component Props' },
    props: [],
  };
  const inherited: ExtractedGroup[] = [];
  const seenInheritedLabels = new Set<string>();
  const visiting = new Set<string>();

  const pushInherited = (group: ExtractedGroup) => {
    if (seenInheritedLabels.has(group.label)) return;
    seenInheritedLabels.add(group.label);
    inherited.push(group);
  };

  /** Walk an object literal in this same source file. Spreads referring to other
   * locally-defined object literals get inlined recursively; their own spreads
   * become inherited groups on the result. */
  const walk = (obj: ts.ObjectLiteralExpression) => {
    for (const member of obj.properties) {
      if (ts.isSpreadAssignment(member)) {
        const expr = member.expression;
        let bagName = '';
        if (ts.isIdentifier(expr)) {
          bagName = expr.text;
        } else if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression)) {
          bagName = expr.expression.text;
        }
        if (!bagName) continue;

        // 1. hard-coded shared bags (editStateProps / themeProps / openShadowCommonProps)
        const known = resolveBag(bagName);
        if (known) {
          pushInherited(known.group);
          continue;
        }
        // 2. factory-call bag (createTransitionProps / createOptionProps / …)
        const factoryBag = resolveFactoryBag(bagName);
        if (factoryBag) {
          pushInherited(factoryBag);
          continue;
        }
        // 3. variable defined in THIS file — inline-expand its members recursively
        const localObj = findVarObjectLiteral(sf, bagName);
        if (localObj) {
          if (visiting.has(bagName)) {
            // circular — skip silently
            continue;
          }
          visiting.add(bagName);
          walk(localObj);
          visiting.delete(bagName);
          continue;
        }
        // 4. sibling component's exported props bag
        const sibling = resolveSiblingComponentBag(bagName);
        if (sibling) {
          pushInherited(sibling);
          continue;
        }
        // 5. unknown — surface as a placeholder so the author notices
        pushInherited({
          label: bagName,
          displayLabel: { 'zh-CN': `继承自 ${bagName}（未解析）`, en: `Inherited from ${bagName} (unresolved)` },
          props: [],
        });
        continue;
      }
      if (!ts.isPropertyAssignment(member) && !ts.isShorthandPropertyAssignment(member)) continue;

      const name = (() => {
        const n = (member as ts.PropertyAssignment).name;
        if (!n) return '';
        if (ts.isIdentifier(n) || ts.isStringLiteralLike(n)) return n.text;
        return '';
      })();
      if (!name) continue;

      const tsdocRaw = getLeadingTsdoc(source, member.getFullStart());
      const tsdoc = tsdocRaw ? parseTsdoc(tsdocRaw) : { desc: {} as Partial<Record<Locale, string>> };
      if (tsdoc.internal) continue;

      // Initializer text
      let factoryText = '';
      let derivedType = 'unknown';
      if (ts.isPropertyAssignment(member)) {
        const init = member.initializer;
        factoryText = source.slice(init.getStart(sf), init.getEnd()).trim();
        derivedType = deriveTypeFromInitializer(init, source, sf);
      } else if (ts.isShorthandPropertyAssignment(member)) {
        factoryText = name;
        derivedType = deriveTypeFromShorthand(name);
      }

      // Later occurrences override earlier ones (matches JS spread semantics).
      const existingIdx = ownGroup.props.findIndex((p) => p.name === name);
      const entry: ExtractedProp = {
        name,
        factory: factoryText,
        type: tsdoc.type || derivedType,
        default: tsdoc.default,
        desc: tsdoc.desc,
      };
      if (existingIdx >= 0) ownGroup.props[existingIdx] = entry;
      else ownGroup.props.push(entry);
    }
  };

  walk(target);

  return {
    componentName: propsVarName.replace(/Props$/, ''),
    groups: [ownGroup, ...inherited],
  };
}

function deriveTypeFromShorthand(name: string): string {
  if (name === 'undefBoolProp') return 'boolean';
  if (name === 'valueProp') return 'boolean | string | object | number';
  if (name === 'sizeProp') return 'Responsive<string | number>';
  if (name === 'transitionProp') return 'string | TransitionProps';
  return 'unknown';
}

function deriveTypeFromInitializer(node: ts.Expression, source: string, sf: ts.SourceFile): string {
  // Constructors like undefBoolProp (identifier reference)
  if (ts.isIdentifier(node)) {
    return deriveTypeFromShorthand(node.text);
  }
  // PropString<T>(RegExp, …) — CallExpression
  if (ts.isCallExpression(node)) {
    const exprText = source.slice(node.expression.getStart(sf), node.expression.getEnd());
    let factoryName = exprText;
    let genericText: string | undefined;
    if (node.typeArguments && node.typeArguments.length) {
      const start = node.typeArguments[0].getStart(sf);
      const end = node.typeArguments[node.typeArguments.length - 1].getEnd();
      genericText = source.slice(start, end).trim();
      const ltIdx = exprText.indexOf('<');
      if (ltIdx >= 0) factoryName = exprText.slice(0, ltIdx).trim();
    }
    const runtimeArgs: string[] = [];
    for (const arg of node.arguments) {
      runtimeArgs.push(source.slice(arg.getStart(sf), arg.getEnd()).trim());
    }
    return factoryToType(factoryName, genericText, { runtimeArgs });
  }
  // Object literal with `type:` field
  if (ts.isObjectLiteralExpression(node)) {
    for (const p of node.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      if (!ts.isIdentifier(p.name) || p.name.text !== 'type') continue;
      // Use AS-cast text if any
      let init = p.initializer;
      let asType: string | undefined;
      if (ts.isAsExpression(init)) {
        asType = source.slice(init.type.getStart(sf), init.type.getEnd()).trim();
        // Strip leading PropType<...>
        const m = asType.match(/^PropType<([\s\S]+)>$/);
        if (m) asType = m[1].trim();
        init = init.expression;
      }
      if (asType) return asType;
      // Fall back to constructor identifier text
      return source.slice(init.getStart(sf), init.getEnd()).trim();
    }
  }
  return source.slice(node.getStart(sf), node.getEnd()).trim();
}

/** ---- Default-value discovery from <Comp>.tsx ---- */

/** Read createDefineElement(name, Comp, { ... }, ...) defaults object from the .tsx file. */
export function readCreateDefineDefaults(tsxFile: string): Record<string, string> {
  if (!fs.existsSync(tsxFile)) return {};
  const source = fs.readFileSync(tsxFile, 'utf8');
  const sf = ts.createSourceFile(tsxFile, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out: Record<string, string> = {};

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'createDefineElement'
    ) {
      const arg = node.arguments[2];
      if (arg && ts.isObjectLiteralExpression(arg)) {
        for (const p of arg.properties) {
          if (!ts.isPropertyAssignment(p)) continue;
          if (!ts.isIdentifier(p.name) && !ts.isStringLiteralLike(p.name)) continue;
          const key = (p.name as ts.Identifier | ts.StringLiteralLike).text;
          const valueText = source.slice(p.initializer.getStart(sf), p.initializer.getEnd()).trim();
          // skip explicit undefined — semantically the same as "no default"; FormItem and
          // Input use `{ required: undefined }` here as a no-op to suppress inherited defaults
          if (valueText === 'undefined') continue;
          out[key] = valueText;
        }
      }
    }
    node.forEachChild(visit);
  };
  visit(sf);
  return out;
}

/** Read destructuring defaults `const { x = 'y' } = props` inside any function body of the .tsx file. */
export function readSetupDestructureDefaults(tsxFile: string): Record<string, string> {
  if (!fs.existsSync(tsxFile)) return {};
  const source = fs.readFileSync(tsxFile, 'utf8');
  const sf = ts.createSourceFile(tsxFile, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out: Record<string, string> = {};

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isIdentifier(node.initializer) &&
      node.initializer.text === 'props' &&
      ts.isObjectBindingPattern(node.name)
    ) {
      for (const elem of node.name.elements) {
        if (!elem.initializer) continue;
        const key = ts.isIdentifier(elem.propertyName ?? elem.name) ? (elem.propertyName ?? elem.name).getText(sf) : '';
        if (!key) continue;
        out[key] = source.slice(elem.initializer.getStart(sf), elem.initializer.getEnd()).trim();
      }
    }
    node.forEachChild(visit);
  };
  visit(sf);
  return out;
}

/** Convert a kebab-case name to camelCase, e.g. `file-picker` → `filePicker`. */
function kebabToCamel(name: string): string {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Scan all .tsx files in a component folder for `defineCustomElement({ name, props })` calls
 * and return one entry per custom element declared. Resolves `name`/`props` identifiers back
 * to the top-level `const name = '<kebab>'` declarations in the same file.
 */
function discoverCustomElementsInFolder(dir: string): Array<{ kebab: string; propsVar: string; file: string }> {
  if (!fs.existsSync(dir)) return [];
  const out: Array<{ kebab: string; propsVar: string; file: string }> = [];
  for (const f of fs.readdirSync(dir)) {
    if (!/\.tsx$/.test(f) || f.includes('.test.')) continue;
    const file = path.join(dir, f);
    const source = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    // Collect top-level `const x = 'literal'` so we can resolve identifier references
    const stringConsts = new Map<string, string>();
    sf.forEachChild((node) => {
      if (!ts.isVariableStatement(node)) return;
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
        if (ts.isStringLiteralLike(decl.initializer)) {
          stringConsts.set(decl.name.text, decl.initializer.text);
        }
      }
    });

    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'defineCustomElement' &&
        node.arguments.length &&
        ts.isObjectLiteralExpression(node.arguments[0])
      ) {
        const opts = node.arguments[0];
        let kebab = '';
        let propsVar = '';
        for (const p of opts.properties) {
          if (!ts.isPropertyAssignment(p) && !ts.isShorthandPropertyAssignment(p)) continue;
          const key = p.name && (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name)) ? p.name.text : '';
          if (key === 'name') {
            if (ts.isPropertyAssignment(p)) {
              if (ts.isStringLiteralLike(p.initializer)) kebab = p.initializer.text;
              else if (ts.isIdentifier(p.initializer)) kebab = stringConsts.get(p.initializer.text) || '';
            } else {
              // shorthand: `name`
              kebab = stringConsts.get('name') || '';
            }
          } else if (key === 'props') {
            if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.initializer)) propsVar = p.initializer.text;
            else if (ts.isShorthandPropertyAssignment(p)) propsVar = 'props';
          }
        }
        if (kebab && propsVar) out.push({ kebab, propsVar, file });
      }
      node.forEachChild(visit);
    };
    visit(sf);
  }
  return out;
}

/** Inner extraction for a (kebab, propsVar) pair. Used by both the top-level entry and the
 * recursive related-component pass. Avoid infinite recursion by tracking visited kebabs. */
function extractOne(
  compDir: string,
  componentKebab: string,
  propsVar: string,
  typeFile: string,
  source: string,
  visited: Set<string>,
): ExtractResult | null {
  const result = parsePropsObjectFromSource(source, typeFile, propsVar);
  if (!result) return null;

  // Apply default discovery from .tsx files in the same folder
  const tsxCandidates = fs.readdirSync(compDir).filter((f) => /\.tsx$/.test(f) && !f.includes('.test.'));
  const defaults: Record<string, string> = {};
  for (const f of tsxCandidates) {
    Object.assign(defaults, readSetupDestructureDefaults(path.join(compDir, f)));
    Object.assign(defaults, readCreateDefineDefaults(path.join(compDir, f)));
  }
  const ownGroup = result.groups.find((g) => g.label === 'own');
  if (ownGroup) {
    for (const p of ownGroup.props) {
      if (!p.default && defaults[p.name] != null) p.default = defaults[p.name];
    }
  }
  result.componentName = componentKebab;
  return result;
}

/** Top-level: extract props for a component kebab name. */
export function extractComponentProps(componentKebab: string, _visited?: Set<string>): ExtractResult | null {
  const visited = _visited || new Set<string>();
  if (visited.has(componentKebab)) return null;
  visited.add(componentKebab);

  const compDir = path.join(COMPONENTS_DIR, componentKebab);
  const typeFile = path.join(compDir, 'type.ts');
  if (!fs.existsSync(typeFile)) return null;
  const source = fs.readFileSync(typeFile, 'utf8');

  // Prefer the exact `<componentCamel>Props` constant; fall back to first `*Props = freeze(`
  // for backward compat. Without this, files declaring both `popoverFloatingUIProps` and
  // `popoverProps` (or similar pairs) would surface the wrong bag.
  const camel = kebabToCamel(componentKebab);
  const exact = new RegExp(`export\\s+const\\s+(${camel}Props)\\b`);
  const exactMatch = source.match(exact);
  const propsVar = exactMatch
    ? exactMatch[1]
    : (() => {
        const m = source.match(/export\s+const\s+(\w+Props)\s*=\s*freeze\s*\(/);
        return m ? m[1] : null;
      })();
  if (!propsVar) return null;

  const result = extractOne(compDir, componentKebab, propsVar, typeFile, source, visited);
  if (!result) return null;

  // Discover RELATED custom elements declared in the same folder (e.g. CheckboxGroup next to
  // Checkbox, SelectOption/SelectOptgroup next to Select). Skip self; resolve each via the
  // same pipeline so the table renders identically to the primary component.
  const declared = discoverCustomElementsInFolder(compDir);
  const related: ExtractResult[] = [];
  for (const { kebab, propsVar: relPropsVar } of declared) {
    if (kebab === componentKebab || visited.has(kebab)) continue;
    visited.add(kebab);
    const r = extractOne(compDir, kebab, relPropsVar, typeFile, source, visited);
    if (r) related.push(r);
  }
  if (related.length) result.related = related;

  return result;
}
