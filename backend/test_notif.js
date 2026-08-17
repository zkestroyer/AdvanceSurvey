const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notif = await prisma.notification.create({
    data: { title: 'Test 3', message: 'Test 3 message', audience: 'TSO', type: 'info' }
  });
  console.log('Created:', notif);
}
main().catch(console.error).finally(() => prisma.$disconnect());
