const https = require('https');

const baseUrl = 'https://demo.bloomix.io/atsolar/api/v1';

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log('Logging in...');
  const loginRes = await request('POST', '/auth/login', { email: 'admin@advancetelecom.com', password: 'admin123' });
  const token = loginRes.data.token;
  console.log('Got token.');

  console.log('Fetching active survey...');
  const activeRes = await request('GET', '/surveys/active', null, token);
  const template = activeRes.data;
  const templateId = template.id;

  function getOptions(secTitle, qText) {
    if (!template || !template.sections) return [];
    const sec = template.sections.find(s => s.title.toLowerCase().includes(secTitle.toLowerCase()));
    if (!sec) return [];
    const q = sec.questions.find(q => q.questionText.toLowerCase().includes(qText.toLowerCase()));
    if (!q || !q.options) return [];
    return typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
  }

  const schema = [
    // 1. Outlet Details
    { type: 'section', label: '1. Outlet Details' },
    { type: 'date', label: 'Visit Date' },
    { type: 'text', label: 'Outlet Name' },
    { type: 'text', label: 'Outlet Address' },
    { type: 'text', label: 'City / Town' },
    { type: 'text', label: 'Contact Person' },
    { type: 'number', label: 'Contact Number' },
    { type: 'dropdown', label: 'Outlet Type', options: ["Importer", "Distributor", "Dealer", "Wholesaler", "Retailer"] },
    { type: 'dropdown', label: 'Outlet Classification', options: ["Large", "Medium", "Small"] },

    // 2. Solar Panels Survey
    { type: 'section', label: '2. Solar Panels Survey' },
    { type: 'dropdown', label: 'Brand', options: getOptions('Solar Panels', 'Brand') || ["Longi", "Canadian", "JA Solar", "Jinko", "Itel Energy", "Trina"] },
    { type: 'dropdown', label: 'Model', options: getOptions('Solar Panels', 'Model') || [] },
    { type: 'text', label: 'Warranty' },
    { type: 'text', label: 'Description' },
    { type: 'dropdown', label: 'Technology', options: ["Poly", "Mono"] },
    { type: 'dropdown', label: 'Power (Watts)', options: ["275W", "320W", "335W", "400W", "450W", "500W", "550W", "575W", "580W", "585W", "590W", "595W", "600W", "605W", "610W", "615W", "620W", "625W", "630W", "635W", "640W", "645W", "650W", "655W", "660W", "665W", "670W", "675W", "680W", "685W", "690W", "695W", "700W", "705W", "710W", "715W", "720W"] },
    { type: 'dropdown', label: 'Grade / Tier', options: ["Tier 1", "Tier 2", "Tier 3"] },
    { type: 'text', label: 'Key Features' },

    // 3. Inverters Survey
    { type: 'section', label: '3. Inverters Survey' },
    { type: 'dropdown', label: 'Brand', options: getOptions('Inverters', 'Brand') || [] },
    { type: 'dropdown', label: 'Model', options: getOptions('Inverters', 'Model') || [] },
    { type: 'text', label: 'Warranty' },
    { type: 'text', label: 'Description' },
    { type: 'dropdown', label: 'Inverter Type', options: ["Off Grid", "On Grid", "Hybrid"] },
    { type: 'dropdown', label: 'Phase', options: ["Single Phase", "Three Phase"] },
    { type: 'dropdown', label: 'Power (KW)', options: ["1.2", "1.6", "2.2", "2.6", "3", "4", "5", "6", "6.6", "8", "10", "12", "15", "20", "25", "30", "40", "50", "60", "80", "100", "125"] },
    { type: 'dropdown', label: 'Protection', options: ["IP21", "IP54", "IP65", "IP66"] },
    { type: 'text', label: 'Key Features' },

    // 4. Lithium Batteries
    { type: 'section', label: '4. Lithium Batteries' },
    { type: 'dropdown', label: 'Brand', options: getOptions('Lithium Batteries', 'Brand') || [] },
    { type: 'dropdown', label: 'Model', options: getOptions('Lithium Batteries', 'Model') || [] },
    { type: 'text', label: 'Warranty' },
    { type: 'dropdown', label: 'Capacity', options: ["100AH", "105AH", "200AH", "280AH", "314AH"] },
    { type: 'dropdown', label: 'Nominal Voltage', options: ["12.8V", "25.6V", "51.2V"] },
    { type: 'dropdown', label: 'Energy', options: ["1.28KWh", "1.34KWh", "2.56KWh", "3.58KWh", "5.12KWh", "14.3KWh", "16KWh"] },
    { type: 'dropdown', label: 'IP Rating', options: ["IP20", "IP54"] },
    { type: 'text', label: 'Key Features' },

    // 5. All-in-One ESS
    { type: 'section', label: '5. All-in-One ESS' },
    { type: 'dropdown', label: 'Brand', options: getOptions('All in One ESS', 'Brand') || [] },
    { type: 'dropdown', label: 'Model', options: getOptions('All in One ESS', 'Model') || [] },
    { type: 'text', label: 'Warranty' },
    { type: 'dropdown', label: 'Capacity', options: ["500W", "1KW", "3KW", "3.6KW", "5KW"] },
    { type: 'dropdown', label: 'Energy', options: ["1KWh", "2KWh", "5KWh", "8KWh"] },
    { type: 'dropdown', label: 'IP Rating', options: ["IP21", "IP65"] },
    { type: 'text', label: 'Key Features' },

    // 6. C&I ESS
    { type: 'section', label: '6. C&I ESS' },
    { type: 'dropdown', label: 'Brand', options: getOptions('C&I ESS', 'Brand') || [] },
    { type: 'dropdown', label: 'Model', options: getOptions('C&I ESS', 'Model') || [] },
    { type: 'text', label: 'Warranty' },
    { type: 'dropdown', label: 'Capacity', options: ["30KW", "50KW", "125KW"] },
    { type: 'dropdown', label: 'Energy', options: ["30KWh", "50KWh", "60KWh", "138KWh", "240KWh"] },
    { type: 'dropdown', label: 'IP Rating', options: ["IP Rating", "N/A"] },
    { type: 'text', label: 'Key Features' },

    // 7. Source Details
    { type: 'section', label: '7. Source Details' },
    { type: 'text', label: 'Source Name' },
    { type: 'dropdown', label: 'Category', options: ["Dealer", "Distributor", "Wholesaler"] },
    { type: 'text', label: 'Address' },
    { type: 'text', label: 'City / Town' },
    { type: 'text', label: 'Contact Person' },
    { type: 'number', label: 'Contact Number' },
    { type: 'dropdown', label: 'Source Type', options: ["Importer", "Distributor", "Dealer", "Wholesaler", "Retailer"] },
    { type: 'dropdown', label: 'Classification', options: ["Large", "Medium", "Small"] },
    { type: 'dropdown', label: 'Payment Terms', options: ["100% Advance", "Cash", "Credit 15 Days", "Credit 30 Days", "Credit 45 Days", "Credit 60 Days", "Partial Advance", "Other"] },

    // 8. Logistics & Brand Perception
    { type: 'section', label: '8. Logistics & Brand Perception' },
    { type: 'dropdown', label: 'Logistics', options: ["Own", "Source"] },
    { type: 'dropdown', label: 'Dealer Recognition Program (Certificates)', options: ["Yes", "No"] },
    { type: 'dropdown', label: 'Yearly Foreign Trips', options: ["Yes", "No"] },
    { type: 'dropdown', label: 'Loyalty / Dealer Contest Program', options: ["Yes", "No"] },
    { type: 'checkbox', label: 'Reason Unavailability of ITEL Brand', options: ["Price", "Margins", "Quality", "Compatibility", "Warranty", "No Service", "Payment Issues", "Brand Awareness", "Consumer Demand", "Brand Equity", "Lack of Marketing Campaigns", "Discounts / Commissions", "Other (with Remarks)"] },
    { type: 'dropdown', label: 'Willingness to Keep ITEL As', options: ["Distributor", "Dealer", "Wholesaler"] }
  ];

  console.log(`Updating Template ${templateId}...`);
  const updateRes = await request('PUT', `/surveys/config/${templateId}`, {
    title: 'Market Visit Format',
    schema: schema
  }, token);

  console.log('Update response:', updateRes);
}

main().catch(console.error);
