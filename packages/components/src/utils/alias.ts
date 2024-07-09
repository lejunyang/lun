/** default scrollIntoViewIfNeed */
export function scrollIntoView(el: Element, options?: ScrollIntoViewOptions) {
  return el.scrollIntoView({ block: 'nearest', ...options });
}
