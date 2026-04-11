import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const args = process.argv.slice(2);
const targetDir = args[0] || './docs/docs';

// 图片根目录
const imageRoot = './docs/.vuepress/public';

// 支持的图片格式
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'];

/**
 * 递归获取目录下所有Markdown文件
 * @param {string} dir 目录路径
 * @returns {Array} Markdown文件路径数组
 */
function getAllMarkdownFiles(dir) {
  let results = [];
  const list = readdirSync(dir, { withFileTypes: true });
  
  list.forEach(file => {
    const fullPath = join(dir, file.name);
    if (file.isDirectory()) {
      results = [...results, ...getAllMarkdownFiles(fullPath)];
    } else if (file.name.endsWith('.md')) {
      results.push(fullPath);
    }
  });
  
  return results;
}

/**
 * 从Markdown文件中提取图片引用
 * @param {string} filePath 文件路径
 * @returns {Array} 图片引用数组
 */
function extractImageReferences(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const images = [];
  
  // 匹配Markdown图片语法 ![alt](path "title")
  const markdownImageRegex = /!\[.*?\]\((.*?)(?:\s+"[^"]*")?\)/g;
  let match;
  
  while ((match = markdownImageRegex.exec(content)) !== null) {
    const imagePath = match[1];
    // 只处理相对路径的图片，忽略网络图片
    if (!imagePath.startsWith('http')) {
      images.push({
        path: imagePath,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  return images;
}

/**
 * 验证图片路径是否正确
 * @param {string} docPath 文档路径
 * @param {string} imagePath 图片路径
 * @returns {Object} 验证结果
 */
function validateImagePath(docPath, imagePath) {
  let resolvedPath;
  
  // 处理绝对路径（以/img开头）
  if (imagePath.startsWith('/img/')) {
    resolvedPath = join(imageRoot, imagePath.substring(1));
  } else {
    // 处理相对路径
    resolvedPath = resolve(docPath, '..', imagePath);
  }
  
  // 检查文件是否存在
  if (existsSync(resolvedPath)) {
    return { valid: true };
  }
  
  // 检查是否是支持的图片格式
  const ext = '.' + resolvedPath.split('.').pop().toLowerCase();
  if (!imageExtensions.includes(ext)) {
    return { 
      valid: false, 
      reason: `不支持的图片格式: ${ext}` 
    };
  }
  
  return { 
    valid: false, 
    reason: `图片文件不存在: ${imagePath}` 
  };
}

/**
 * 主函数
 * @param {string} filePath 文档路径
 */
function validateDocument(filePath) {
  console.log(`检查文档: ${filePath}`);
  const errors = [];
  
  // 提取图片引用
  const images = extractImageReferences(filePath);
  
  if (images.length === 0) {
    console.log('  未发现图片引用');
    return [];
  }
  
  console.log(`  发现 ${images.length} 个图片引用`);
  
  // 验证每个图片引用
  images.forEach(image => {
    const result = validateImagePath(filePath, image.path);
    if (!result.valid) {
      errors.push({
        file: filePath,
        image: image.path,
        line: image.line,
        reason: result.reason
      });
    }
  });
  
  return errors;
}

/**
 * 主函数
 */
function main() {
  console.log('开始验证Markdown文档中的图片路径...\n');
  
  // 获取所有Markdown文件
  const markdownFiles = getAllMarkdownFiles(targetDir);
  
  if (markdownFiles.length === 0) {
    console.log('未找到Markdown文件');
    process.exit(0);
  }
  
  console.log(`找到 ${markdownFiles.length} 个Markdown文件\n`);
  
  // 验证所有文档
  let totalErrors = [];
  markdownFiles.forEach(file => {
    const errors = validateDocument(file);
    totalErrors = [...totalErrors, ...errors];
  });
  
  // 输出结果
  if (totalErrors.length > 0) {
    console.log('\n发现以下错误:');
    totalErrors.forEach(error => {
      console.log(`- 文件: ${error.file}`);
      console.log(`  行号: ${error.line}`);
      console.log(`  图片: ${error.image}`);
      console.log(`  错误: ${error.reason}\n`);
    });
    
    console.log(`总计发现 ${totalErrors.length} 个错误`);
    process.exit(1);
  } else {
    console.log('所有图片路径验证通过!');
  }
}

main();
