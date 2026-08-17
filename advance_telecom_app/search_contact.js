const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\HP\\.gemini\\antigravity\\scratch\\AdvanceTelecom\\Zainab_Handover\\advance_telecom_app\\lib\\screens\\survey_execution_screen.dart', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('contact') || line.toLowerCase().includes('name') || line.toLowerCase().includes('autofill')) {
    console.log(`${index + 1}: ${line}`);
  }
});
