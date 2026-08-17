const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('C:\\Users\\HP\\Downloads\\Market visit format for sales team Final.xlsx');

const schema = [];

// Helper to add a section
function addSection(label) {
  schema.push({ type: 'section', label });
}

// Helper to add a question
function addQuestion(type, label, options = null) {
  const q = { type, label, required: false };
  if (options) {
    // Unique and filter empty
    q.options = [...new Set(options)].filter(o => o && String(o).trim() !== '');
  }
  schema.push(q);
}

// 1. Outlet Details
addSection('Outlet Details');
addQuestion('text', 'Name of Outlet');
addQuestion('date', 'Visit Date');
addQuestion('text', 'Address');
addQuestion('text', 'City / Town');
addQuestion('text', 'Contact Person');
addQuestion('text', 'Contact No(s)');
addQuestion('dropdown', 'Type', ['Importer', 'Distributor', 'Dealer', 'Wholesaler', 'Retailer']);
addQuestion('dropdown', 'Classification', ['Large', 'Medium', 'Small']);

// 2. Solar Panels
addSection('Solar Panels');
const spSheet = workbook.Sheets['Solar Panels'];
const spData = xlsx.utils.sheet_to_json(spSheet, { header: 1 });
let spBrands = [];
let spModels = [];
let spWarranties = [];
let spGrades = [];
for (let i = 6; i < spData.length; i++) {
  const row = spData[i];
  if (row[1]) spBrands.push(row[1]);
  if (row[2]) spModels.push(row[2]);
  if (row[3]) spWarranties.push(row[3]);
  if (row[4] && String(row[4]).trim() !== '') spGrades.push(row[4]);
}
addQuestion('dropdown', 'Brand', spBrands);
addQuestion('dropdown', 'Model', spModels);
addQuestion('text', 'Warranty');
addQuestion('text', 'Grade / Tiers');
addQuestion('text', 'Description');
addQuestion('text', 'Key Features');

// 3. Inverters
addSection('Inverters');
const invSheet = workbook.Sheets['Inverters'];
const invData = xlsx.utils.sheet_to_json(invSheet, { header: 1 });
let invBrands = [];
let invModels = [];
for (let i = 6; i < invData.length; i++) {
  if (invData[i][1]) invBrands.push(invData[i][1]);
  if (invData[i][2]) invModels.push(invData[i][2]);
}
addQuestion('dropdown', 'Brand', invBrands);
addQuestion('dropdown', 'Model', invModels);
addQuestion('text', 'Warranty');
addQuestion('text', 'Description');
addQuestion('dropdown', 'Inverter Type', ['On Grid', 'Off Grid', 'Hybrid']);
addQuestion('text', 'Key Features');

// 4. Lithium Batteries
addSection('Lithium Batteries');
const lbSheet = workbook.Sheets['Lithium Batteries'];
const lbData = xlsx.utils.sheet_to_json(lbSheet, { header: 1 });
let lbBrands = [];
let lbModels = [];
for (let i = 7; i < lbData.length; i++) {
  if (lbData[i][1]) lbBrands.push(lbData[i][1]);
  if (lbData[i][2]) lbModels.push(lbData[i][2]);
}
addQuestion('dropdown', 'Brand', lbBrands);
addQuestion('dropdown', 'Model', lbModels);
addQuestion('text', 'Warranty');
addQuestion('text', 'Capacity');
addQuestion('text', 'Description');
addQuestion('text', 'Key Features');

// 5. All in One ESS
addSection('All in One ESS');
const essSheet = workbook.Sheets['All in One ESS'];
const essData = xlsx.utils.sheet_to_json(essSheet, { header: 1 });
let essBrands = [];
let essModels = [];
for (let i = 5; i < essData.length; i++) {
  if (essData[i][1]) essBrands.push(essData[i][1]);
  if (essData[i][2]) essModels.push(essData[i][2]);
}
addQuestion('dropdown', 'Brand', essBrands);
addQuestion('dropdown', 'Model', essModels);
addQuestion('text', 'Warranty');
addQuestion('text', 'Description');
addQuestion('text', 'Power Banks');
addQuestion('text', 'IP Rating');

// 6. C&I ESS
addSection('C&I ESS');
const ciSheet = workbook.Sheets['C&I ESS'];
if (ciSheet) {
  const ciData = xlsx.utils.sheet_to_json(ciSheet, { header: 1 });
  let ciBrands = [];
  let ciModels = [];
  for (let i = 5; i < ciData.length; i++) {
    if (ciData[i][1]) ciBrands.push(ciData[i][1]);
    if (ciData[i][2]) ciModels.push(ciData[i][2]);
  }
  addQuestion('dropdown', 'Brand', ciBrands);
  addQuestion('dropdown', 'Model', ciModels);
  addQuestion('text', 'Warranty');
  addQuestion('text', 'Description');
  addQuestion('text', 'Power Banks');
  addQuestion('text', 'IP Rating');
}

// 7. Source
addSection('Source');
addQuestion('dropdown', 'Source of Buying', ['Importer', 'Distributor', 'Dealer', 'Wholesaler', 'Retailer']);
addQuestion('text', 'Category');
addQuestion('text', 'Address');
addQuestion('text', 'City');
addQuestion('text', 'Contact');
addQuestion('text', 'Type');
addQuestion('text', 'Incentives');
addQuestion('text', 'Logistics');
addQuestion('text', 'Reason Unavailability');
addQuestion('text', 'Willingness to keep Itel as');

fs.writeFileSync('survey_schema.json', JSON.stringify(schema, null, 2));
console.log('Successfully wrote survey_schema.json');
