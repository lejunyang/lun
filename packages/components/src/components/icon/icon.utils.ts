/**
 * process svg html string, set its `fill` `width` and `height` attribute so that it inherits `color` and `font-size` style\
 * also add `part` attribute to make it accessible outside the shadow\
 * `fill`: `currentColor`\
 * `width`: `1em`\
 * `height`: `1em`
 */
export function svgFillAndSizeDefaultMutator(svgHtml: string) {
  return svgHtml.replace(/<svg(.+?)>/, (_match, $1) => {
    $1 = $1.replace(/fill=".+?"/, '');
    $1 = $1.replace(/part=".+?"/, '');
    $1 = $1.replace(/width="[\w\d.]+"/, '');
    $1 = $1.replace(/height="[\w\d.]+"/, '');
    return `<svg ${$1} fill="currentColor" width="1em" height="1em" part="svg">`
  })
}