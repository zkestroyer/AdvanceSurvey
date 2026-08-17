"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
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
    const hashedPassword = await bcrypt_1.default.hash('password123', 10);
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
    // Create Survey Config
    const schemaStr = JSON.stringify([
        { id: 'q1', type: 'radio', label: 'Are Advance Telecom posters clearly visible at the shop entrance?', options: ['Yes', 'No'] },
        { id: 'q2', type: 'radio', label: 'Shop Size Classification?', options: ['Small', 'Medium', 'Large', 'Mega'] },
        { id: 'q3', type: 'text', label: 'Name of the top-selling competitor brand at this outlet?' },
        { id: 'q4', type: 'text', label: 'General Feedback from the Shop Owner:' }
    ]);
    const surveyConfig = await prisma.surveyConfig.upsert({
        where: { id: 1 },
        update: { title: 'Retailer Market Assessment 2026', schema: schemaStr, isActive: true },
        create: {
            title: 'Retailer Market Assessment 2026',
            schema: schemaStr,
            isActive: true,
        },
    });
    // Create Mock Responses
    if (shops.length > 0) {
        await prisma.surveyResponse.createMany({
            skipDuplicates: true,
            data: [
                {
                    surveyId: surveyConfig.id,
                    userId: tso.id,
                    shopId: shops[0].id,
                    data: JSON.stringify({
                        'q1': 'Yes',
                        'q2': 'Large',
                        'q3': 'Samsung',
                        'q4': 'Demand for premium models is high.'
                    }),
                    submittedAt: new Date(Date.now() - 86400000) // 1 day ago
                },
                {
                    surveyId: surveyConfig.id,
                    userId: tso.id,
                    shopId: shops[1].id,
                    data: JSON.stringify({
                        'q1': 'No',
                        'q2': 'Medium',
                        'q3': 'Vivo',
                        'q4': 'Requested new marketing material.'
                    }),
                    submittedAt: new Date(Date.now() - 3600000) // 1 hour ago
                }
            ]
        });
    }
    console.log('Seeding complete.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
