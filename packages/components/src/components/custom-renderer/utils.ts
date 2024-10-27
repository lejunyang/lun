import { createElement, fromObject, isString } from '@lun/utils';

export function generateWithTemplate(template: HTMLTemplateElement, props: Record<string, string>) {
  const {
    dataset: { element, ...others },
  } = template;

  const getValue = (val?: string | null) => {
    if (!val) return val;
    const match = val.match(/^{(\w+)}$/);
    if (match && match[1] in props) return props[match[1]];
    else return val;
  };

  const elementName = getValue(element);
  if (elementName && isString(elementName)) {
    return createElement(
      elementName as any,
      fromObject(others, (k, v) => [k, getValue(v)] as const) as any,
      { skipFalsyValue: true },
    );
  }
  const content = document.importNode(template.content, true);
  const innerTemplates = content.querySelectorAll('template');
  for (const t of innerTemplates) {
    const el = generateWithTemplate(t, props);
    if (el) t.replaceWith(el);
  }
  return content;
}
