const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Typography
  { regex: /\btext-slate-800\b/g, replacement: "text-text-main" },
  { regex: /\btext-slate-900\b/g, replacement: "text-text-main" },
  { regex: /\btext-slate-700\b/g, replacement: "text-text-sub" },
  { regex: /\btext-slate-600\b/g, replacement: "text-text-muted" },
  { regex: /\btext-indigo-600\b/g, replacement: "text-cyan-500" },

  // Backgrounds & Surfaces
  { regex: /\bbg-slate-50\b/g, replacement: "bg-bg-base" },
  { regex: /\bbg-white\/80\b/g, replacement: "bg-panel-bg" },
  { regex: /\bbg-white\b/g, replacement: "bg-panel-solid" },
  
  // Borders
  { regex: /\bborder-slate-200\b/g, replacement: "border-panel-border" },
  { regex: /\bborder-slate-100\b/g, replacement: "border-panel-border" },
  { regex: /\bborder-slate-800\b/g, replacement: "border-panel-solid" },
];

function processDirectory(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) return console.log('Unable to scan directory: ' + err);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
         processDirectory(filePath);
      } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        replacements.forEach(({ regex, replacement }) => {
          content = content.replace(regex, replacement);
        });

        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated: ${file}`);
        }
      }
    });
  });
}

processDirectory(directoryPath);
