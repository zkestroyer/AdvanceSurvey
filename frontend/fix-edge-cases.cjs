const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { regex: /\bbg-slate-100\b/g, replacement: "bg-panel-border" },
  { regex: /\bbg-slate-300\b/g, replacement: "bg-panel-border" },
  { regex: /\bbg-slate-400\b/g, replacement: "bg-text-muted" },
  { regex: /\bbg-slate-500\b/g, replacement: "bg-text-muted" },
  { regex: /\bbg-slate-600\b/g, replacement: "bg-text-sub" },
  { regex: /\bbg-slate-700\b/g, replacement: "bg-panel-border" },
  { regex: /\bhover:bg-slate-700\b/g, replacement: "hover:bg-panel-border" },
  { regex: /\bbg-slate-500\/10\b/g, replacement: "bg-panel-border" },
  { regex: /\bbg-slate-500\/20\b/g, replacement: "bg-panel-border" },
  { regex: /\bborder-slate-500\/20\b/g, replacement: "border-panel-border" },
  { regex: /\bborder-slate-500\/30\b/g, replacement: "border-panel-border" },
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
