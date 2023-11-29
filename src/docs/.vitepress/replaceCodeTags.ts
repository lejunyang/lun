import fs from 'node:fs';
import path from 'node:path';

const suffixMap: Record<string, string> = {
  '.vue.tsx': 'vueJSX',
  '.vue.jsx': 'vueJSX',
  '.react.tsx': 'react',
  '.react.jsx': 'react',
  '.html': 'html',
};

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
      fileCodeTypeMap[name][type] = `import ${name + type} from './${fileName}?raw';`;
    }
  });
  const codeTagRegex = /<!--\s*@Code:(\w+)\s*-->/g;
  const imports: string[] = [];
  let newContent = fileContent.replace(codeTagRegex, (match, name) => {
    const codeType = fileCodeTypeMap[name];
    if (!codeType) return match;
    let propResult = '';
    Object.entries(codeType).forEach(([type, source]) => {
      propResult += ` :${type}="${name + type}"`;
      imports.push(source);
    });
    return `<Code${propResult} />`;
  });
  if (!imports.length) return newContent;
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
