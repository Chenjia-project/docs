import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const sidebarConfigPath = join(process.cwd(), 'docs/.vuepress/collections.ts');
const docsBasePath = join(process.cwd(), 'docs/docs');

function parseSidebarConfig(content) {
  let withoutComments = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  const sidebarStartIndex = withoutComments.indexOf('sidebar:');
  if (sidebarStartIndex === -1) {
    throw new Error('未找到sidebar配置');
  }

  let bracketCount = 0;
  let inString = false;
  let escapeNext = false;
  let startIndex = -1;
  let endIndex = -1;

  for (let i = sidebarStartIndex + 8; i < withoutComments.length; i++) {
    const char = withoutComments[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '[') {
      if (startIndex === -1) {
        startIndex = i;
      }
      bracketCount++;
    } else if (char === ']') {
      bracketCount--;
      if (bracketCount === 0 && startIndex !== -1) {
        endIndex = i + 1;
        break;
      }
    }
  }

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('无法解析sidebar数组');
  }

  const sidebarCode = withoutComments.substring(startIndex, endIndex);

  const preparedCode = sidebarCode
    .replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '"$1":')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');

  try {
    return eval(`(${preparedCode})`);
  } catch (e) {
    console.error('解析sidebar配置时出错:', e);
    console.error('准备解析的代码:', preparedCode);
    throw e;
  }
}

function validateSidebarItems(items, basePath, prefix = '') {
  const errors = [];
  const fullPath = join(basePath, prefix);

  for (const item of items) {
    if (typeof item === 'string') {
      const fileName = `${item}.md`;
      const filePath = join(fullPath, fileName);

      if (!existsSync(filePath)) {
        errors.push(`文件不存在: ${join(prefix, fileName)}`);
      }
    } else if (typeof item === 'object') {
      if (item.items) {
        const newPrefix = item.prefix ? join(prefix, item.prefix) : prefix;
        const subErrors = validateSidebarItems(item.items, basePath, newPrefix);
        errors.push(...subErrors);
      }
    }
  }

  return errors;
}

function main() {
  try {
    const configContent = readFileSync(sidebarConfigPath, 'utf-8');

    const sidebar = parseSidebarConfig(configContent);

    const errors = validateSidebarItems(sidebar, docsBasePath);

    if (errors.length > 0) {
      console.log('发现以下错误:');
      errors.forEach(error => console.log('- ' + error));
      process.exit(1);
    } else {
      console.log('所有侧边栏配置验证通过!');
    }
  } catch (error) {
    console.error('验证过程中出错:', error.message);
    process.exit(1);
  }
}

main();
