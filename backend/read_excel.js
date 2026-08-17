const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve('C:\\Users\\HP\\Downloads\\Market visit format for sales team Final.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('=== Sheet Names ===');
console.log(workbook.SheetNames);
console.log(`\nTotal sheets: ${workbook.SheetNames.length}\n`);

for (const sheetName of workbook.SheetNames) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SHEET: "${sheetName}"`);
  console.log('='.repeat(80));
  
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  
  console.log(`Rows: ${data.length}`);
  console.log(`Columns: ${data[0] ? data[0].length : 0}\n`);
  
  // Print all rows
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    // Filter out completely empty rows
    if (row.every(cell => cell === '' || cell === null || cell === undefined)) continue;
    console.log(`Row ${i}: ${JSON.stringify(row)}`);
  }
}
