const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const replacements = [
  { regex: /opacity-0 group-hover:opacity-100/g, replacement: "opacity-100" },
  { regex: /transition-opacity/g, replacement: "" },
];

function processDirectory(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) return console.log('Unable to scan directory: ' + err);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
         processDirectory(filePath);
      } else if (filePath.endsWith('.tsx')) {
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
