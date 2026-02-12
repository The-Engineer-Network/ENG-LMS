#!/usr/bin/env node

/**
 * Script to replace all console.log/error/warn statements with logger equivalents
 * Run: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');

const directories = ['app', 'lib', 'components'];
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Files to skip
const skipFiles = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'logger.ts', // Don't modify the logger itself
];

function shouldProcessFile(filePath) {
  // Skip if in excluded directories
  if (skipFiles.some(skip => filePath.includes(skip))) {
    return false;
  }
  
  // Only process files with correct extensions
  return extensions.some(ext => filePath.endsWith(ext));
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if file already imports logger
    const hasLoggerImport = content.includes('from "@/lib/logger"') || 
                           content.includes("from '@/lib/logger'");
    
    // Check if file uses console statements
    const usesConsole = /console\.(log|error|warn|info|debug)\(/.test(content);
    
    if (!usesConsole) {
      return; // No console statements, skip
    }
    
    // Add logger import if not present
    if (!hasLoggerImport) {
      // Find the last import statement
      const importRegex = /^import .+ from .+$/gm;
      const imports = content.match(importRegex);
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPosition = lastImportIndex + lastImport.length;
        
        content = content.slice(0, insertPosition) + 
                 '\nimport { logger } from "@/lib/logger"' +
                 content.slice(insertPosition);
        modified = true;
      }
    }
    
    // Replace console statements
    const replacements = [
      { from: /console\.log\(/g, to: 'logger.log(' },
      { from: /console\.error\(/g, to: 'logger.error(' },
      { from: /console\.warn\(/g, to: 'logger.warn(' },
      { from: /console\.info\(/g, to: 'logger.info(' },
      { from: /console\.debug\(/g, to: 'logger.debug(' },
    ];
    
    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!skipFiles.includes(file)) {
        walkDirectory(filePath);
      }
    } else if (shouldProcessFile(filePath)) {
      processFile(filePath);
    }
  });
}

console.log('🔍 Searching for console statements...\n');

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`📁 Processing ${dir}/`);
    walkDirectory(dirPath);
  }
});

console.log('\n✅ Done! All console statements have been replaced with logger.');
console.log('💡 Remember to set NODE_ENV=production in your production environment.');
