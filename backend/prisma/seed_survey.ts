import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Survey Template...');

  // Create Template
  const template = await prisma.surveyTemplate.create({
    data: {
      title: 'Market Visit Format',
      description: 'Standard format for sales team market visits',
      isActive: true,
    },
  });

  // Create Section 1: Outlet Details
  const section1 = await prisma.surveySection.create({
    data: {
      templateId: template.id,
      title: 'Outlet Details',
      orderIndex: 0,
    },
  });

  await prisma.surveyQuestion.createMany({
    data: [
      {
        sectionId: section1.id,
        questionText: 'Name of Outlet',
        type: 'text',
        orderIndex: 0,
        isRequired: true,
      },
      {
        sectionId: section1.id,
        questionText: 'Address',
        type: 'text',
        orderIndex: 1,
        isRequired: true,
      },
      {
        sectionId: section1.id,
        questionText: 'City / Town',
        type: 'text',
        orderIndex: 2,
        isRequired: true,
      },
      {
        sectionId: section1.id,
        questionText: 'Contact Person',
        type: 'text',
        orderIndex: 3,
        isRequired: true,
      },
      {
        sectionId: section1.id,
        questionText: 'Contact No(s)',
        type: 'number',
        orderIndex: 4,
        isRequired: true,
      },
      {
        sectionId: section1.id,
        questionText: 'Type',
        type: 'dropdown',
        options: JSON.stringify(['Importer', 'Distributor', 'Dealer', 'Wholesaler', 'Retailer']),
        orderIndex: 5,
        isRequired: true,
      },
      {
        sectionId: section1.id,
        questionText: 'Classification',
        type: 'radio',
        options: JSON.stringify(['Large', 'Medium', 'Small']),
        orderIndex: 6,
        isRequired: true,
      },
    ],
  });

  // Create Section 2: Solar Panels
  const section2 = await prisma.surveySection.create({
    data: {
      templateId: template.id,
      title: 'Solar Panels Information',
      orderIndex: 1,
    },
  });

  await prisma.surveyQuestion.createMany({
    data: [
      {
        sectionId: section2.id,
        questionText: 'Brand',
        type: 'dropdown',
        options: JSON.stringify(['Longi', 'Jinko', 'Trina', 'Canadian Solar', 'JA Solar', 'Other']),
        orderIndex: 0,
        isRequired: true,
      },
      {
        sectionId: section2.id,
        questionText: 'Technology (Poly/Mono/Bifacial)',
        type: 'radio',
        options: JSON.stringify(['Poly', 'Mono', 'Bifacial']),
        orderIndex: 1,
        isRequired: true,
      },
      {
        sectionId: section2.id,
        questionText: 'Power (Watts)',
        type: 'number',
        orderIndex: 2,
        isRequired: true,
      },
      {
        sectionId: section2.id,
        questionText: 'Grade / Tier',
        type: 'radio',
        options: JSON.stringify(['Tier 1', 'Tier 2', 'Tier 3']),
        orderIndex: 3,
        isRequired: true,
      },
      {
        sectionId: section2.id,
        questionText: 'Key Features / Warranty Details',
        type: 'text',
        orderIndex: 4,
        isRequired: false,
      },
      {
        sectionId: section2.id,
        questionText: 'Take Photo of Display/Stock',
        type: 'photo',
        orderIndex: 5,
        isRequired: false,
      },
    ],
  });

  console.log('Seed completed successfully. Survey Template ID:', template.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
