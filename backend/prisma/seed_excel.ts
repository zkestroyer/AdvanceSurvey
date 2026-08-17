import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Complete ITEL Excel Survey Template...');

  // Delete all existing responses, answers, and templates to start fresh
  await prisma.surveyAnswer.deleteMany({});
  await prisma.surveyResponse.deleteMany({});
  await prisma.surveyQuestion.deleteMany({});
  await prisma.surveySection.deleteMany({});
  await prisma.surveyTemplate.deleteMany({});

  // Create Template
  const template = await prisma.surveyTemplate.create({
    data: {
      title: 'itel Market Visit Format',
      description: 'Official survey mapped from Excel for sales team market visits.',
      isActive: true,
    },
  });

  // SECTION 1: OUTLET DETAILS
  const s1 = await prisma.surveySection.create({ data: { templateId: template.id, title: 'Outlet Details', orderIndex: 0 } });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s1.id, questionText: 'Name of Outlet', type: 'text', orderIndex: 0, isRequired: true },
      { sectionId: s1.id, questionText: 'Address', type: 'text', orderIndex: 1, isRequired: true },
      { sectionId: s1.id, questionText: 'City / Town', type: 'text', orderIndex: 2, isRequired: true },
      { sectionId: s1.id, questionText: 'Contact Person', type: 'text', orderIndex: 3, isRequired: true },
      { sectionId: s1.id, questionText: 'Contact No(s)', type: 'number', orderIndex: 4, isRequired: true },
      { sectionId: s1.id, questionText: 'Type', type: 'dropdown', options: JSON.stringify(['Importer', 'Distributor', 'Dealer', 'Wholesaler', 'Retailer']), orderIndex: 5, isRequired: true },
      { sectionId: s1.id, questionText: 'Classification', type: 'dropdown', options: JSON.stringify(['Large', 'Medium', 'Small']), orderIndex: 6, isRequired: true },
    ],
  });

  // SECTION 2: SOURCE DETAILS & PAYMENT TERMS
  const s2 = await prisma.surveySection.create({ data: { templateId: template.id, title: 'Sourcing & Payment Terms', orderIndex: 1 } });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s2.id, questionText: 'Source of Buying (Name of Dealer/Wholesaler/Distributor)', type: 'text', orderIndex: 0, isRequired: true },
      { sectionId: s2.id, questionText: 'Payment Terms', type: 'dropdown', options: JSON.stringify(['100% ADVANCE', 'PART ADVANCE & PART COD', '100% COD', 'PART ADVANCE & PART CREDIT', '100% CREDIT', 'CASH PURCHASE']), orderIndex: 1, isRequired: true },
      { sectionId: s2.id, questionText: 'Logistics', type: 'radio', options: JSON.stringify(['OWN', 'SOURCE']), orderIndex: 2, isRequired: true },
    ],
  });

  // SECTION 3: INCENTIVES & PROGRAMS
  const s3 = await prisma.surveySection.create({ data: { templateId: template.id, title: 'Incentives & Programs', orderIndex: 2 } });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s3.id, questionText: 'Incentives / Commissions / Discounts', type: 'dropdown', options: JSON.stringify(['TIMELY PAYMENT BASED', 'GIFT CARDS FOR NEW CUSTOMER', 'SPECIAL DEALER / WHOLESALE/ DISTRIBUTOR DISCOUNT ON VOLUME BUYING', 'PERFORMANCE BASED REBATES', 'SPECIAL SEASON INCENTIVE', 'SALES VOLUME BONUSES', 'PRODUCT SPECIFIC REWARD']), orderIndex: 0, isRequired: false },
      { sectionId: s3.id, questionText: 'Dealers Recognition Programs (Certificates)', type: 'radio', options: JSON.stringify(['Yes', 'No']), orderIndex: 1, isRequired: false },
      { sectionId: s3.id, questionText: 'Yearly Foreign Trips', type: 'radio', options: JSON.stringify(['Yes', 'No']), orderIndex: 2, isRequired: false },
      { sectionId: s3.id, questionText: 'Loyalty / Dealer Contests Programe', type: 'radio', options: JSON.stringify(['Yes', 'No']), orderIndex: 3, isRequired: false },
    ],
  });

  // SECTION 4: ITEL BRAND PERCEPTION
  const s4 = await prisma.surveySection.create({ data: { templateId: template.id, title: 'itel Brand Perception', orderIndex: 3 } });
  await prisma.surveyQuestion.createMany({
    data: [
      { sectionId: s4.id, questionText: 'Reason for Unavailability of itel Brand', type: 'dropdown', options: JSON.stringify(['PRICE', 'MARGINS', 'QUALITY', 'CAMPATABILITY', 'WARRANTY', 'NO SERVICE', 'PAYMENT ISSUES', 'BRAND AWARENESS', 'CONSUMER DEMANDS', 'BRAND EQUITY', 'LACK OF MARKETING COMPGAINS', 'DISCOUNTS / COMMISIONS']), orderIndex: 0, isRequired: false },
      { sectionId: s4.id, questionText: 'Willingness to keep itel as', type: 'dropdown', options: JSON.stringify(['DISTRIBUTOR', 'DEALER', 'WHOLSALER']), orderIndex: 1, isRequired: true },
    ],
  });

  console.log('Seed completed successfully. ITEL Survey Template ID:', template.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
