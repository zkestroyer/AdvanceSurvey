const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Typography
  { regex: /\btext-white\b/g, replacement: "text-text-main" },
  { regex: /\btext-slate-200\b/g, replacement: "text-text-sub" },
  { regex: /\btext-slate-300\b/g, replacement: "text-text-sub" },
  { regex: /\btext-slate-400\b/g, replacement: "text-text-muted" },
  { regex: /\btext-slate-500\b/g, replacement: "text-text-muted" },

  // Backgrounds & Surfaces
  { regex: /\bbg-slate-900\/40\b/g, replacement: "bg-panel-bg" },
  { regex: /\bbg-slate-900\/50\b/g, replacement: "bg-panel-bg" },
  { regex: /\bbg-slate-900\/60\b/g, replacement: "bg-panel-bg" },
  { regex: /\bbg-slate-900\/70\b/g, replacement: "bg-panel-bg" },
  { regex: /\bbg-slate-900\/80\b/g, replacement: "bg-panel-bg" },
  { regex: /\bbg-slate-800\/50\b/g, replacement: "bg-panel-bg" },
  { regex: /\bbg-slate-800\b/g, replacement: "bg-panel-solid" },
  { regex: /\bbg-slate-900\b/g, replacement: "bg-panel-solid" },
  
  // Borders
  { regex: /\bborder-white\/5\b/g, replacement: "border-panel-border" },
  { regex: /\bborder-white\/10\b/g, replacement: "border-panel-border" },
  { regex: /\bborder-white\/20\b/g, replacement: "border-panel-border" },

  // Danger Status
  { regex: /\bbg-rose-500\/10\b/g, replacement: "bg-danger-bg" },
  { regex: /\btext-rose-400\b/g, replacement: "text-danger-text" },
  { regex: /\btext-rose-500\b/g, replacement: "text-danger-text" },
  { regex: /\bborder-rose-500\/20\b/g, replacement: "border-danger-border" },
  { regex: /\bbg-rose-500\/20\b/g, replacement: "bg-danger-bg" },
  { regex: /\bborder-rose-500\/30\b/g, replacement: "border-danger-border" },
  { regex: /\bborder-rose-500\/50\b/g, replacement: "border-danger-border" },
  { regex: /\bborder-rose-500\b/g, replacement: "border-danger-border" },

  // Success Status
  { regex: /\bbg-emerald-500\/10\b/g, replacement: "bg-success-bg" },
  { regex: /\btext-emerald-400\b/g, replacement: "text-success-text" },
  { regex: /\bborder-emerald-500\/20\b/g, replacement: "border-success-border" },

  // Warning Status
  { regex: /\bbg-amber-500\/10\b/g, replacement: "bg-warning-bg" },
  { regex: /\bbg-amber-500\/20\b/g, replacement: "bg-warning-bg" },
  { regex: /\btext-amber-400\b/g, replacement: "text-warning-text" },
  { regex: /\bborder-amber-500\/20\b/g, replacement: "border-warning-border" },
  { regex: /\bborder-amber-500\/30\b/g, replacement: "border-warning-border" },
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
