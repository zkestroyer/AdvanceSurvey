import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', permissions: '{"all": true}' },
  });

  const tsoRole = await prisma.role.upsert({
    where: { name: 'TSO' },
    update: {},
    create: { name: 'TSO', permissions: '{"surveys": true, "checkin": true}' },
  });

  // Create Territory
  const territory = await prisma.territory.upsert({
    where: { name: 'Islamabad North' },
    update: {},
    create: { name: 'Islamabad North', region: 'North' },
  });

  const territory2 = await prisma.territory.upsert({
    where: { name: 'Lahore Central' },
    update: {},
    create: { name: 'Lahore Central', region: 'Central' },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@advancetelecom.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@advancetelecom.com',
      password: hashedPassword,
      name: 'System Admin',
      roleId: adminRole.id,
    },
  });

  const tso = await prisma.user.upsert({
    where: { email: 'tso@advancetelecom.com' },
    update: { password: hashedPassword },
    create: {
      email: 'tso@advancetelecom.com',
      password: hashedPassword,
      name: 'Ali Jafri',
      roleId: tsoRole.id,
      territoryId: territory.id,
    },
  });

  // Create Shops
  await prisma.shop.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Mobile Zone Blue Area', ownerName: 'Waqas Ali', type: 'Dealer', classification: 'Large', territoryId: territory.id, latitude: 33.7294, longitude: 73.0931 },
      { name: 'Telecom Hub F-10', ownerName: 'Ahmed Khan', type: 'Retailer', classification: 'Medium', territoryId: territory.id, latitude: 33.6941, longitude: 73.0142 },
      { name: 'City Cell Plaza', ownerName: 'Farhan', type: 'Retailer', classification: 'Small', territoryId: territory.id, latitude: 33.7121, longitude: 73.0560 },
      { name: 'Tech Store Gulberg', ownerName: 'Hassan', type: 'Dealer', classification: 'Large', territoryId: territory2.id, latitude: 31.5204, longitude: 74.3587 },
      { name: 'Mega Mobiles', ownerName: 'Zeeshan', type: 'Retailer', classification: 'Medium', territoryId: territory2.id, latitude: 31.5000, longitude: 74.3400 },
    ]
  });

  const shops = await prisma.shop.findMany();
  


  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
