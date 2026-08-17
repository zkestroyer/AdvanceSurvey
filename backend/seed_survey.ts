import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching current active survey to preserve Brand/Model lists...');
  const activeTemplate = await prisma.surveyTemplate.findFirst({
    where: { isActive: true },
    include: {
      sections: {
        include: { questions: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Helper to extract options from old survey
  function getOptions(sectionTitle: string, questionText: string): any {
    if (!activeTemplate) return null;
    const section = activeTemplate.sections.find(s => s.title.toLowerCase().includes(sectionTitle.toLowerCase()));
    if (!section) return null;
    const question = section.questions.find(q => q.questionText.toLowerCase().includes(questionText.toLowerCase()));
    if (!question || !question.options) return null;
    return JSON.parse(question.options);
  }

  // Deactivate existing templates
  await prisma.surveyTemplate.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });

  console.log('Creating new Market Visit Format survey...');
  const newTemplate = await prisma.surveyTemplate.create({
    data: {
      title: 'Market Visit Format',
      description: 'Updated survey matching PDF specifications',
      isActive: true,
    }
  });

  // 1. Outlet Details
  const s1 = await prisma.surveySection.create({
    data: { templateId: newTemplate.id, title: '1. Outlet Details', orderIndex: 1 }
  });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s1.id, orderIndex: 1, type: 'date', questionText: 'Visit Date' },
      { sectionId: s1.id, orderIndex: 2, type: 'text', questionText: 'Outlet Name' },
      { sectionId: s1.id, orderIndex: 3, type: 'text', questionText: 'Outlet Address' },
      { sectionId: s1.id, orderIndex: 4, type: 'text', questionText: 'City / Town' },
      { sectionId: s1.id, orderIndex: 5, type: 'text', questionText: 'Contact Person' },
      { sectionId: s1.id, orderIndex: 6, type: 'number', questionText: 'Contact Number' },
      { sectionId: s1.id, orderIndex: 7, type: 'dropdown', questionText: 'Outlet Type', options: JSON.stringify(["Importer", "Distributor", "Dealer", "Wholesaler", "Retailer"]) },
      { sectionId: s1.id, orderIndex: 8, type: 'dropdown', questionText: 'Outlet Classification', options: JSON.stringify(["Large", "Medium", "Small"]) },
    ]
  });

  // 2. Solar Panels Survey
  const s2 = await prisma.surveySection.create({
    data: { templateId: newTemplate.id, title: '2. Solar Panels Survey', orderIndex: 2 }
  });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s2.id, orderIndex: 1, type: 'dropdown', questionText: 'Brand', options: JSON.stringify(getOptions('Solar Panels', 'Brand') || ["Longi", "Canadian", "JA Solar", "Jinko", "Itel Energy", "Trina"]) },
      { sectionId: s2.id, orderIndex: 2, type: 'dropdown', questionText: 'Model', options: JSON.stringify(getOptions('Solar Panels', 'Model') || ["Hi-MO 5", "Hi-MO 6"]) },
      { sectionId: s2.id, orderIndex: 3, type: 'text', questionText: 'Warranty' },
      { sectionId: s2.id, orderIndex: 4, type: 'text', questionText: 'Description' },
      { sectionId: s2.id, orderIndex: 5, type: 'dropdown', questionText: 'Technology', options: JSON.stringify(["Poly", "Mono"]) },
      { sectionId: s2.id, orderIndex: 6, type: 'dropdown', questionText: 'Power (Watts)', options: JSON.stringify(["275W", "320W", "335W", "400W", "450W", "500W", "550W", "575W", "580W", "585W", "590W", "595W", "600W", "605W", "610W", "615W", "620W", "625W", "630W", "635W", "640W", "645W", "650W", "655W", "660W", "665W", "670W", "675W", "680W", "685W", "690W", "695W", "700W", "705W", "710W", "715W", "720W"]) },
      { sectionId: s2.id, orderIndex: 7, type: 'dropdown', questionText: 'Grade / Tier', options: JSON.stringify(["Tier 1", "Tier 2", "Tier 3"]) },
      { sectionId: s2.id, orderIndex: 8, type: 'text', questionText: 'Key Features' },
      { sectionId: s2.id, orderIndex: 9, type: 'number', questionText: 'Distributor / Sub-dealer Price (Buying)' },
      { sectionId: s2.id, orderIndex: 10, type: 'number', questionText: 'Retail Price (Selling)' },
    ]
  });

  // 3. Inverters Survey
  const s3 = await prisma.surveySection.create({
    data: { templateId: newTemplate.id, title: '3. Inverters Survey', orderIndex: 3 }
  });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s3.id, orderIndex: 1, type: 'dropdown', questionText: 'Brand', options: JSON.stringify(getOptions('Inverters', 'Brand') || []) },
      { sectionId: s3.id, orderIndex: 2, type: 'dropdown', questionText: 'Model', options: JSON.stringify(getOptions('Inverters', 'Model') || []) },
      { sectionId: s3.id, orderIndex: 3, type: 'text', questionText: 'Warranty' },
      { sectionId: s3.id, orderIndex: 4, type: 'text', questionText: 'Description' },
      { sectionId: s3.id, orderIndex: 5, type: 'dropdown', questionText: 'Inverter Type', options: JSON.stringify(["Off Grid", "On Grid", "Hybrid"]) },
      { sectionId: s3.id, orderIndex: 6, type: 'dropdown', questionText: 'Phase', options: JSON.stringify(["Single Phase", "Three Phase"]) },
      { sectionId: s3.id, orderIndex: 7, type: 'dropdown', questionText: 'Power (KW)', options: JSON.stringify(["1.2", "1.6", "2.2", "2.6", "3", "4", "5", "6", "6.6", "8", "10", "12", "15", "20", "25", "30", "40", "50", "60", "80", "100", "125"]) },
      { sectionId: s3.id, orderIndex: 8, type: 'dropdown', questionText: 'Protection', options: JSON.stringify(["IP21", "IP54", "IP65", "IP66"]) },
      { sectionId: s3.id, orderIndex: 9, type: 'text', questionText: 'Key Features' },
      { sectionId: s3.id, orderIndex: 10, type: 'number', questionText: 'Distributor / Sub-dealer Price (Buying)' },
      { sectionId: s3.id, orderIndex: 11, type: 'number', questionText: 'Retail Price (Selling)' },
    ]
  });

  // 4. Lithium Batteries
  const s4 = await prisma.surveySection.create({
    data: { templateId: newTemplate.id, title: '4. Lithium Batteries', orderIndex: 4 }
  });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s4.id, orderIndex: 1, type: 'dropdown', questionText: 'Brand', options: JSON.stringify(getOptions('Lithium Batteries', 'Brand') || []) },
      { sectionId: s4.id, orderIndex: 2, type: 'dropdown', questionText: 'Model', options: JSON.stringify(getOptions('Lithium Batteries', 'Model') || []) },
      { sectionId: s4.id, orderIndex: 3, type: 'text', questionText: 'Warranty' },
      { sectionId: s4.id, orderIndex: 4, type: 'dropdown', questionText: 'Capacity', options: JSON.stringify(["100AH", "105AH", "200AH", "280AH", "314AH"]) },
      { sectionId: s4.id, orderIndex: 5, type: 'dropdown', questionText: 'Nominal Voltage', options: JSON.stringify(["12.8V", "25.6V", "51.2V"]) },
      { sectionId: s4.id, orderIndex: 6, type: 'dropdown', questionText: 'Energy', options: JSON.stringify(["1.28KWh", "1.34KWh", "2.56KWh", "3.58KWh", "5.12KWh", "14.3KWh", "16KWh"]) },
      { sectionId: s4.id, orderIndex: 7, type: 'dropdown', questionText: 'IP Rating', options: JSON.stringify(["IP20", "IP54"]) },
      { sectionId: s4.id, orderIndex: 8, type: 'text', questionText: 'Key Features' },
      { sectionId: s4.id, orderIndex: 9, type: 'number', questionText: 'Distributor / Sub-dealer Price (Buying)' },
      { sectionId: s4.id, orderIndex: 10, type: 'number', questionText: 'Retail Price (Selling)' },
    ]
  });

  // 5. All-in-One ESS
  const s5 = await prisma.surveySection.create({
    data: { templateId: newTemplate.id, title: '5. All-in-One ESS', orderIndex: 5 }
  });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s5.id, orderIndex: 1, type: 'dropdown', questionText: 'Brand', options: JSON.stringify(getOptions('All in One ESS', 'Brand') || []) },
      { sectionId: s5.id, orderIndex: 2, type: 'dropdown', questionText: 'Model', options: JSON.stringify(getOptions('All in One ESS', 'Model') || []) },
      { sectionId: s5.id, orderIndex: 3, type: 'text', questionText: 'Warranty' },
      { sectionId: s5.id, orderIndex: 4, type: 'dropdown', questionText: 'Capacity', options: JSON.stringify(["500W", "1KW", "3KW", "3.6KW", "5KW"]) },
      { sectionId: s5.id, orderIndex: 5, type: 'dropdown', questionText: 'Energy', options: JSON.stringify(["1KWh", "2KWh", "5KWh", "8KWh"]) },
      { sectionId: s5.id, orderIndex: 6, type: 'dropdown', questionText: 'IP Rating', options: JSON.stringify(["IP21", "IP65"]) },
      { sectionId: s5.id, orderIndex: 7, type: 'text', questionText: 'Key Features' },
      { sectionId: s5.id, orderIndex: 8, type: 'number', questionText: 'Distributor / Sub-dealer Price (Buying)' },
      { sectionId: s5.id, orderIndex: 9, type: 'number', questionText: 'Retail Price (Selling)' },
    ]
  });

  // 6. C&I ESS
  const s6 = await prisma.surveySection.create({
    data: { templateId: newTemplate.id, title: '6. C&I ESS', orderIndex: 6 }
  });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s6.id, orderIndex: 1, type: 'dropdown', questionText: 'Brand', options: JSON.stringify(getOptions('C&I ESS', 'Brand') || []) },
      { sectionId: s6.id, orderIndex: 2, type: 'dropdown', questionText: 'Model', options: JSON.stringify(getOptions('C&I ESS', 'Model') || []) },
      { sectionId: s6.id, orderIndex: 3, type: 'text', questionText: 'Warranty' },
      { sectionId: s6.id, orderIndex: 4, type: 'dropdown', questionText: 'Capacity', options: JSON.stringify(["30KW", "50KW", "125KW"]) },
      { sectionId: s6.id, orderIndex: 5, type: 'dropdown', questionText: 'Energy', options: JSON.stringify(["30KWh", "50KWh", "60KWh", "138KWh", "240KWh"]) },
      { sectionId: s6.id, orderIndex: 6, type: 'dropdown', questionText: 'IP Rating', options: JSON.stringify(["IP Rating", "N/A"]) },
      { sectionId: s6.id, orderIndex: 7, type: 'text', questionText: 'Key Features' },
      { sectionId: s6.id, orderIndex: 8, type: 'number', questionText: 'Distributor / Sub-dealer Price (Buying)' },
      { sectionId: s6.id, orderIndex: 9, type: 'number', questionText: 'Retail Price (Selling)' },
    ]
  });

  // 7. Source Details
  const s7 = await prisma.surveySection.create({
    data: { templateId: newTemplate.id, title: '7. Source Details', orderIndex: 7 }
  });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s7.id, orderIndex: 1, type: 'text', questionText: 'Source Name' },
      { sectionId: s7.id, orderIndex: 2, type: 'dropdown', questionText: 'Category', options: JSON.stringify(["Dealer", "Distributor", "Wholesaler"]) },
      { sectionId: s7.id, orderIndex: 3, type: 'text', questionText: 'Address' },
      { sectionId: s7.id, orderIndex: 4, type: 'text', questionText: 'City / Town' },
      { sectionId: s7.id, orderIndex: 5, type: 'text', questionText: 'Contact Person' },
      { sectionId: s7.id, orderIndex: 6, type: 'number', questionText: 'Contact Number' },
      { sectionId: s7.id, orderIndex: 7, type: 'dropdown', questionText: 'Source Type', options: JSON.stringify(["Importer", "Distributor", "Dealer", "Wholesaler", "Retailer"]) },
      { sectionId: s7.id, orderIndex: 8, type: 'dropdown', questionText: 'Classification', options: JSON.stringify(["Large", "Medium", "Small"]) },
      { sectionId: s7.id, orderIndex: 9, type: 'dropdown', questionText: 'Payment Terms', options: JSON.stringify(["100% Advance", "Cash", "Credit 15 Days", "Credit 30 Days", "Credit 45 Days", "Credit 60 Days", "Partial Advance", "Other"]) },
    ]
  });

  // 8. Logistics & Brand Perception
  const s8 = await prisma.surveySection.create({
    data: { templateId: newTemplate.id, title: '8. Logistics & Brand Perception', orderIndex: 8 }
  });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s8.id, orderIndex: 1, type: 'dropdown', questionText: 'Logistics', options: JSON.stringify(["Own", "Source"]) },
      { sectionId: s8.id, orderIndex: 2, type: 'dropdown', questionText: 'Dealer Recognition Program (Certificates)', options: JSON.stringify(["Yes", "No"]) },
      { sectionId: s8.id, orderIndex: 3, type: 'dropdown', questionText: 'Yearly Foreign Trips', options: JSON.stringify(["Yes", "No"]) },
      { sectionId: s8.id, orderIndex: 4, type: 'dropdown', questionText: 'Loyalty / Dealer Contest Program', options: JSON.stringify(["Yes", "No"]) },
      { sectionId: s8.id, orderIndex: 5, type: 'checkbox', questionText: 'Reason Unavailability of ITEL Brand', options: JSON.stringify(["Price", "Margins", "Quality", "Compatibility", "Warranty", "No Service", "Payment Issues", "Brand Awareness", "Consumer Demand", "Brand Equity", "Lack of Marketing Campaigns", "Discounts / Commissions", "Other (with Remarks)"]) },
      { sectionId: s8.id, orderIndex: 6, type: 'dropdown', questionText: 'Willingness to Keep ITEL As', options: JSON.stringify(["Distributor", "Dealer", "Wholesaler"]) },
    ]
  });

  console.log('Successfully created new survey template! ID:', newTemplate.id);
}

main()
  .catch(e => {
    console.error(e);
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
