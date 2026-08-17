import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();

async function main() {
  console.log('Reading Excel file...');
  const wb = xlsx.readFile('PRODUCTS CATALOG.xlsx');
  const sheetName = wb.SheetNames[0] as string;
  const sheet = wb.Sheets[sheetName]!;
  const data: any[] = xlsx.utils.sheet_to_json(sheet);

  let currentCategory = 'Hardware';
  const products = [];

  for (const row of data) {
    if (row['__EMPTY_1'] && !row['__EMPTY']) {
      currentCategory = row['__EMPTY_1'].trim();
    } else if (row['__EMPTY'] && typeof row['__EMPTY'] === 'number') {
      const description = row['__EMPTY_1'] ? row['__EMPTY_1'].trim() : '';
      const typeSize = row['__EMPTY_2'] ? row['__EMPTY_2'].toString().trim() : '';
      const colour = row['__EMPTY_3'] ? row['__EMPTY_3'].trim() : '';
      const packing = row['__EMPTY_4'] ? row['__EMPTY_4'].trim() : '';
      
      const name = [description, typeSize, colour].filter(Boolean).join(' ');
      
      products.push({
        name: name,
        category: currentCategory,
        brand: 'Advance Telecom',
        model: typeSize,
        price: 0,
        isActive: true,
        warranty: packing
      });
    }
  }

  console.log(`Found ${products.length} products. Clearing existing products...`);
  await prisma.product.deleteMany({});
  
  console.log('Inserting products...');
  await prisma.product.createMany({
    data: products
  });
  
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
