const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding Master Data...');

  // Regions
  const regionSouth = await prisma.region.upsert({ where: { name: 'South' }, update: {}, create: { name: 'South' } });
  const regionCentral = await prisma.region.upsert({ where: { name: 'Central' }, update: {}, create: { name: 'Central' } });
  const regionNorth = await prisma.region.upsert({ where: { name: 'North' }, update: {}, create: { name: 'North' } });

  // Cities
  const cityKHI = await prisma.city.create({ data: { name: 'Karachi', regionId: regionSouth.id } });
  const cityLHR = await prisma.city.create({ data: { name: 'Lahore', regionId: regionCentral.id } });
  const cityISB = await prisma.city.create({ data: { name: 'Islamabad', regionId: regionNorth.id } });

  // Territories
  await prisma.territory.upsert({ where: { name: 'Territory 1 (South)' }, update: {}, create: { name: 'Territory 1 (South)', region: 'South' } });
  await prisma.territory.upsert({ where: { name: 'Territory 2 (South)' }, update: {}, create: { name: 'Territory 2 (South)', region: 'South' } });
  await prisma.territory.upsert({ where: { name: 'Territory 3 (Central)' }, update: {}, create: { name: 'Territory 3 (Central)', region: 'Central' } });
  await prisma.territory.upsert({ where: { name: 'Territory 4 (North)' }, update: {}, create: { name: 'Territory 4 (North)', region: 'North' } });

  // Areas
  await prisma.area.create({ data: { name: 'Saddar', cityId: cityKHI.id } });
  await prisma.area.create({ data: { name: 'Clifton', cityId: cityKHI.id } });
  await prisma.area.create({ data: { name: 'Gulberg', cityId: cityLHR.id } });
  await prisma.area.create({ data: { name: 'F-8', cityId: cityISB.id } });

  console.log('Seed complete!');
}

seed().catch(e => console.error(e)).finally(() => prisma.$disconnect());
