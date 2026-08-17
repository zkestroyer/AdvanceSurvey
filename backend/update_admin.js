const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { id: 1 },
    data: { email: 'admin@telecom.co' }
  });
  console.log("Updated admin email to admin@telecom.co");
}

main().catch(console.error).finally(() => prisma.$disconnect());
