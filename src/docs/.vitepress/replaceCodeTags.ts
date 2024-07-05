import fs from 'node:fs';
import path from 'node:path';
import { capitalize } from '@lun/utils';

const suffixMap: Record<string, string> = {
  '.vue.tsx': 'vueTSX',
  '.react.tsx': 'reactTSX',
  '.html': 'html',
};
const suffixReverseMap = Object.fromEntries(Object.entries(suffixMap).map(([key, value]) => [value, key]));

/** replace specific code comments in md with Code component, add import script for that */
export function replaceCodeTags(filePath: string, fileContent: string) {
  const directoryPath = path.dirname(filePath);
  const fileCodeTypeMap: Record<string, Record<string, string>> = {};
  fs.readdirSync(directoryPath).forEach((fileName) => {
    const suffixKey = Object.keys(suffixMap).find((key) => fileName.endsWith(key));
    if (suffixKey) {
      const name = fileName.slice(0, -suffixKey.length);
      if (!fileCodeTypeMap[name]) fileCodeTypeMap[name] = {};
      const type = suffixMap[suffixKey];
      const isDev = name.startsWith('_dev');
      const componentName = capitalize(isDev ? name.slice(1) : name);
      // suppose we always have a vue code case, we import it as a component rather than raw string, then we use it as Code's default slot to reduce white screen time
      const vueSSRImport = type.startsWith('vue') ? `import ${componentName}ForSSR from './${fileName}';\n` : '';
      fileCodeTypeMap[name][type] = `${vueSSRImport}import ${name + type} from './${fileName}?raw';`;
    }
  });
  const codeTagRegex = /<!--\s*@Code:(\w+)\s*-->/g;
  const imports: string[] = [];
  let newContent = fileContent.replace(codeTagRegex, (match, name: string) => {
    const codeType = fileCodeTypeMap[name];
    if (!codeType) return match;
    const isDev = name.startsWith('_dev');
    const componentName = capitalize(isDev ? name.slice(1) : name);
    let propResult = '';
    Object.entries(codeType).forEach(([type, source]) => {
      propResult += ` :${type}="${name + type}"`;
      propResult += ` ${type}Path="${name + suffixReverseMap[type]}"`;
      imports.push(source);
    });
    return `<Code${name.startsWith('_dev') ? ' dev' : ''}${propResult}><${componentName}ForSSR /></Code>`;
  });
  if (!imports.length) return newContent;
  imports.unshift("import { inBrowser } from 'vitepress';");
  let hasScriptSetup = false;
  const scriptSetupRegex = /<script\s+setup>([\s\S]*?)<\/script>/;
  newContent = newContent.replace(scriptSetupRegex, (_, scriptContent) => {
    hasScriptSetup = true;
    return `<script setup>\n${imports.join('\n')}${scriptContent}</script>`;
  });
  if (!hasScriptSetup) {
    newContent += `\n<script setup>\n${imports.join('\n')}\n</script>`;
  }
  return newContent;
}
