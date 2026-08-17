const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const regions = await prisma.region.findMany();
  console.log('Regions:', regions);
}

check().finally(() => prisma.$disconnect());
