const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const surveys = await prisma.surveyConfig.findMany();
  console.log(JSON.stringify(surveys, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
