const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipe() {
  console.log('Starting data wipe...');
  
  // Delete related data first
  await prisma.surveyAnswer.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.shop.deleteMany();
  
  // Delete standalone data
  await prisma.product.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.tradeProgram.deleteMany();
  await prisma.notification.deleteMany();
  
  // Wipe users except Admin and Management
  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
  const mgmtRole = await prisma.role.findFirst({ where: { name: 'Management' } });
  
  const keepRoleIds = [];
  if (adminRole) keepRoleIds.push(adminRole.id);
  if (mgmtRole) keepRoleIds.push(mgmtRole.id);

  if (keepRoleIds.length > 0) {
    await prisma.user.deleteMany({
      where: {
        roleId: { notIn: keepRoleIds }
      }
    });
  } else {
    // Fallback: Keep user with ID 1
    await prisma.user.deleteMany({
      where: { id: { not: 1 } }
    });
  }

  console.log('Data wiped successfully while preserving forms, regions, and admin users.');
}

wipe()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
