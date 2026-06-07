import { extractComponentProps, type Locale } from './extractComponentProps';

/**
 * Append a "组件属性 / Props" section to the rendered markdown when the file
 * lives under (en/)?components/<name>/index.md and the component's type.ts
 * is parsable. The section embeds the `<ComponentProps :data="..." />` Vue
 * component which renders an l-table.
 *
 * Skip cases:
 * - file is not a `components/<name>/index.md`
 * - the markdown already contains a "组件属性" / "Props" H2
 * - the component's type.ts can't be located or parsed
 */
export function injectPropsTable(filePath: string, fileContent: string): string {
  if (!filePath) {
    return fileContent;
  }
  const norm = filePath.replace(/\\/g, '/');
  const m = norm.match(/\/docs(?:\/en)?\/components\/([^/]+)\/index\.md$/);
  if (!m) {
    console.error('[injectPropsTable] not correct path', m);
    return fileContent;
  }
  const componentKebab = m[1];
  const isEn = /\/docs\/en\//.test(norm);
  const locale: Locale = isEn ? 'en' : 'zh-CN';

  // Skip if author already wrote a "组件属性" / "Props" H2 themselves
  const titleZh = '组件属性';
  const titleEn = 'Props';
  if (new RegExp(`^##\\s+${titleZh}\\b`, 'm').test(fileContent)) {
    console.log('[injectPropsTable] 组件属性已存在', filePath);
    return fileContent;
  }
  if (isEn && new RegExp(`^##\\s+${titleEn}\\b`, 'm').test(fileContent)) {
    console.log('[injectPropsTable] Props section existed', filePath);
    return fileContent;
  }

  let extracted;
  try {
    extracted = extractComponentProps(componentKebab);
  } catch (e) {
    console.warn(`[injectPropsTable] extract failed for ${componentKebab}:`, e);
    return fileContent;
  }
  if (!extracted) {
    console.log('[injectPropsTable] extract no content', filePath);
    return fileContent;
  }

  const data = serializeForVue(extracted, locale);
  const heading = isEn ? '## Props' : '## 组件属性';
  // Encode data as a base64 JSON string to avoid quote/markdown collisions
  const encoded = Buffer.from(JSON.stringify(data), 'utf8').toString('base64');
  const block = `\n\n${heading}\n\n<ComponentProps payload="${encoded}" />\n`;
  return fileContent + block;
}

function serializeForVue(extracted: ReturnType<typeof extractComponentProps>, locale: Locale) {
  if (!extracted) return null;
  const serializeOne = (r: NonNullable<ReturnType<typeof extractComponentProps>>) => ({
    componentName: r.componentName,
    groups: r.groups.map((g) => ({
      label: g.label,
      displayLabel: g.displayLabel[locale] || g.displayLabel['zh-CN'] || g.label,
      props: g.props.map((p) => ({
        name: p.name,
        type: p.type,
        default: p.default ?? '',
        desc: p.desc[locale] || p.desc['zh-CN'] || '',
      })),
    })),
  });
  return {
    locale,
    ...serializeOne(extracted),
    related: (extracted.related || []).map(serializeOne),
  };
}
