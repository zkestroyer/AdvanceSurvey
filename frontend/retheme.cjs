const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = [
  // Typography
  { regex: /text-slate-900/g, replacement: "text-white" },
  { regex: /text-slate-800/g, replacement: "text-slate-200" },
  { regex: /text-slate-700/g, replacement: "text-slate-300" },
  { regex: /text-slate-600/g, replacement: "text-slate-400" },
  { regex: /bg-slate-50\b/g, replacement: "bg-slate-800/30" },
  { regex: /bg-slate-100\b/g, replacement: "bg-white/5" },
  { regex: /bg-slate-200\b/g, replacement: "bg-white/10" },
  { regex: /border-slate-100/g, replacement: "border-white/5" },
  { regex: /border-slate-200/g, replacement: "border-white/10" },
  { regex: /border-slate-300/g, replacement: "border-white/20" },

  // Backgrounds & Surfaces
  { regex: /bg-white\/20/g, replacement: "bg-slate-900/40" },
  { regex: /bg-white\/30/g, replacement: "bg-slate-900/50" },
  { regex: /bg-white\/40/g, replacement: "bg-slate-900/60" },
  { regex: /bg-white\/50/g, replacement: "bg-slate-900/70" },
  { regex: /bg-white\/60/g, replacement: "bg-slate-900/80" },
  { regex: /border-white\/60/g, replacement: "border-white/10" },
  { regex: /border-white\/40/g, replacement: "border-white/10" },
  { regex: /border-white\/50/g, replacement: "border-white/10" },
  { regex: /bg-white\b/g, replacement: "bg-transparent" },
  
  // Specific Component Classes
  { regex: /bg-indigo-600 hover:bg-indigo-700 text-white/g, replacement: "glass-button" },
  { regex: /bg-indigo-600\b/g, replacement: "bg-cyan-500" },
  { regex: /text-indigo-600/g, replacement: "text-cyan-400" },
  { regex: /text-indigo-500/g, replacement: "text-cyan-400" },
  { regex: /border-indigo-500/g, replacement: "border-cyan-400" },
  { regex: /border-indigo-300/g, replacement: "border-cyan-500/30" },
  { regex: /bg-indigo-50\b/g, replacement: "bg-cyan-500/10" },
  { regex: /bg-indigo-100\b/g, replacement: "bg-cyan-500/20" },
  
  // Tables
  { regex: /<table className="w-full text-left border-collapse">/g, replacement: "<table className=\"w-full text-left border-collapse glass-table\">" },
  { regex: /<tr className="bg-slate-900\/50 backdrop-blur-md/g, replacement: "<tr className=\"bg-slate-900/80 backdrop-blur-md" }, // because bg-white/30 became bg-slate-900/50
];

function processDirectory(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) return console.log('Unable to scan directory: ' + err);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
         processDirectory(filePath);
      } else if (filePath.endsWith('.tsx') && !filePath.includes('Dashboard.tsx') && !filePath.includes('Layout.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        replacements.forEach(({ regex, replacement }) => {
          content = content.replace(regex, replacement);
        });

        // specific inputs to glass-input
        content = content.replace(/className="([^"]*)border border-white\/10([^"]*)"/g, (match, p1, p2) => {
           if(match.includes('px-4 py-2') && !match.includes('glass-panel') && !match.includes('glass-input')) {
              return `className="${p1}glass-input ${p2}"`.replace('border border-white/10', '').replace('bg-transparent', '').replace('bg-slate-900/40', '');
           }
           return match;
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
