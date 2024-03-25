import { isString } from '@lun/utils';

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
    const el = document.createElement(elementName);
    for (let [key, value] of Object.entries(others)) {
      value = getValue(value)!;
      if (!value) return;
      if (key in el && key !== 'style') (el as any)[key] = value;
      else el.setAttribute(key, value);
    }
    return el;
  }
  const content = document.importNode(template.content, true);
  const innerTemplates = content.querySelectorAll('template');
  for (const t of innerTemplates) {
    const el = generateWithTemplate(t, props);
    if (el) t.replaceWith(el);
  }
  return content;
}
