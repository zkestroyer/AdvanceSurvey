const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(tickets.map(t => ({ id: t.id, subject: t.subject, photo: t.photo ? t.photo.substring(0, 50) + (t.photo.length > 50 ? '...' : '') : null })));
  process.exit(0);
})();
