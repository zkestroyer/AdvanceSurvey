const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany({ orderBy: { id: 'desc' }, take: 2 });
  const userNotifs = await prisma.userNotification.findMany({ orderBy: { id: 'desc' }, take: 5 });
  console.log('Notifications:', notifs);
  console.log('UserNotifications:', userNotifs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
