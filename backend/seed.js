const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productCatalog = {
  'Solar Panels': {
    'Longi': ['Hi-MO - X10', 'Hi-MO - 7', 'Hi-MO - X6', 'Hi-MO 6', 'Hi-MO 5', 'Hi-MO 9'],
    'Canadian': ['TOPBiHiKu 7', 'HiKu 7', 'HiHero+', 'TOPBiHiKu 6', 'HiKu 6', 'BiHiKu 7'],
    'JA Solar': ['DeepBlue 2.0', 'DeepBlue 3.0', 'DeepBlue 4.0 / Pro', 'DeepBlue 5.0'],
    'Jinko': ['Tiger Neo 2.0', 'Tiger Neo 3.0', 'Tiger Neo 72 HC', 'Tiger Neo 60 HC', 'Tiger Pro 72HC', 'Tiger Pro 60 HC', 'Legacy Series (Cheetah & Swan)'],
    'Trina': ['Vertex N', 'Vertex S', 'Tall Max Series'],
  },
  'Inverters': {
    'Itel Energy': ['IP54 - 1.6KW 1P', 'IP54 - 3KW 1P', 'IP54 - 4KW 1P', 'IP54 - 6KW 1P', 'IP54 - 8KW 1P', 'IP54 - 12KW 1P', 'IP66 - 6.6KW 1P', 'IP66 - 8KW 3P', 'IP66 - 12KW 3P'],
    'Fronus': ['Meta Series PV 9000', 'Meta Series PV 14000', 'Infineon Reborn PV 2200', 'Infineon Reborn PV 3200', 'Infineon Reborn ECO 4200', 'Infineon Reborn PV 5200', 'Infineon Reborn ECO 6200', 'Infineon Reborn PV 7200', 'Infineon Reborn PV 9200', 'Infineon Reborn PV 12200'],
    'Solax': ['LV 6KW 1P', 'LV 8KW 1P', 'LV 10KW 1P', 'LV 10KW 3P', 'LV 12KW 1P', 'LV 12KW 3P'],
    'Ziewnic': ['LOBO Series PV7000', 'LOBO Series PV9000', 'LOBO Series PV10000', 'Max Series PV2500', 'Max Series PV4200', 'Max Series PV5000', 'Max Series PV7000', 'Diamond Series PV3000', 'Diamond Series PV4500', 'Diamond Series PV6500', 'Diamond Series PV8500', 'Diamond Series PV13000', 'Z5 Series PV4000', 'Z5 Series PV6500', 'Z5 Series PV8500', 'Axpert Twin Premium + PV5000', 'Axpert Twin Premium + PV7000', 'Axpert Ultra Twin PV10000', 'Axpert Ultra Twin PV12000', 'Roux Mini Series PV5000', 'Roux Lite Series PV6000', 'Roux Lite Series PV8000', 'Roux Series PV7000', 'Roux Series PV9000', 'Roux Series PV15000', 'Roux Ultra Series PV12000', 'Roux Ultra Series PV15000', 'Lenox 3.0 Series PV8000', 'Lenox 3.0 Series PV10500', 'Lenox 3.0 Series PV16000', 'Lenox 3.0 Series PV15600 3P', 'Lenox 3.0 Series PV20000 3P'],
    'Inverex': ['Veron II Premium 1.2', 'Veron II Premium 1.6', 'Veron II Premium 2.6', 'Veron II Premium 4', 'Veron II Premium 6', 'Yukon II 3.5', 'Yukon II 5.6', 'Nitrox Hybrid 3KW SP', 'Nitrox Hybrid 6.6KW SP', 'Nitrox Hybrid 10KW SP', 'Nitrox Hybrid 8KW 3P', 'Nitrox Hybrid 13KW 3P', 'Nitrox Hybrid 16KW 3P', 'Nitrox Hybrid 20KW 3P', 'Nitrox On Grid 6KW', 'Nitrox On Grid 10KW', 'Nitrox On Grid 15KW', 'Nitrox On Grid 20KW', 'Nitrox On Grid 35KW', 'Nitrox On Grid 50KW', 'Nitrox On Grid 75KW', 'Nitrox On Grid 110KW', 'Nitrox On Grid 136KW'],
    'Solis': ['Hybrid 6KW Plus LV SP', 'Hybrid 8KW Pro LV SP', 'Hybrid 8KW Plus LV SP', 'Hybrid 10KW Plus LV SP', 'Hybrid 12KW Plus LV SP', 'Hybrid 10KW HV 3P', 'Hybrid 12KW HV 3P', 'Hybrid 15KW HV 3P', 'Hybrid 20KW HV 3P', 'Hybrid 50KW HV 3P', 'Hybrid 125KW HV 3P', 'ON Grid 10KW S5', 'ON Grid 15KW S5', 'ON Grid 30KW 5G', 'ON Grid 50KW 5G', 'ON Grid 125KW 5G', 'ON Grid 150KW 5G'],
    'Goodwe': ['ES Uniq 6KW', 'ES Uniq 8KW', 'ES Uniq 10KW', 'ES Uniq 12KW', 'Hybrid 10KW 3P', 'Hybrid 12KW 3P', 'Hybrid 20KW 3P', 'Hybrid 50KW 3P', 'On Grid 5KW', 'On Grid 10KW', 'On Grid 20KW', 'On Grid 30KW', 'On Grid 50KW'],
    'Knox': ['Krypton ECO 4000', 'Krypton ECO 5000', 'Krypton ECO 6600', 'Krypton 6000', 'Krypton 6500', 'Krypton 9000', 'Krypton 9055', 'Krypton 12002', 'Krypton 13002', 'Krypton 15002', 'Xenon 12066', 'Xenon 18000 3P', 'ASW 5000-T', 'ASW 6000-T', 'ASW 8K-LT-G2', 'ASW 12K-LT-G2', 'ASW 13K-LT-G3', 'XEROX G4 10KW', 'XEROX G4 Pro 10.2KW', 'XEROX G4 Pro 15.2KW', 'XEROX G4 Pro 20.2KW', 'XEROX G4 Pro 25.2KW', 'XEROX G4 Pro 30KW', 'G2 45KW', 'XEROX G4 Pro 50KW', 'XEROX G4 Pro 60KW', 'XEROX G4 Pro 125KW'],
    'Fox Ess': ['On Grid 8KW 3P', 'On Grid 10KW 3P', 'On Grid 10KW 3P + Power Vault', 'On Grid 15KW 3P + Power Vault', 'On Grid 15KW 3P', 'On Grid 17KW 3P', 'On Grid 20KW 3P', 'On Grid 25KW 3P', 'On Grid 36KW 3P', 'On Grid 50KW 3P', 'On Grid 60KW 3P', 'On Grid 75KW 3P', 'On Grid 110KW 3P', 'On Grid 125KW 3P', 'Hybrid H1 6KW SP', 'Hybrid 8KW SP', 'Hybrid 10.5KW SP', 'Hybrid 12KW 3P', 'Hybrid 15KW 3P', 'Hybrid 20KW 3P', 'Hybrid 30KW 3P', 'Hybrid 50KW 3P', 'Hybrid 60KW 3P', 'Hybrid 125KW 3P'],
    'Sungrow': ['On Grid SG5RT 5KW with Dongle', 'On Grid SG20RT 20KW with Dongle', 'On Grid SG33CX-P2 33KW', 'On Grid SG125CX-P2 33KW', 'On Grid SG150CX 150KW', 'On Grid SG350HX 350KW', 'Hybrid SH10T 10KW', 'Hybrid SH10T 15KW', 'Hybrid SH10T 20KW', 'Hybrid SH10T 25KW'],
    'Huawei': ['On Grid 5KTL 3P with Dongle', 'On Grid 10KTL 3P with Dongle', 'On Grid 12KTL 3P with Dongle', 'On Grid 15KTL 3P with Dongle', 'On Grid 20KTL 3P with Dongle', 'On Grid 25KTL 3P with Dongle', 'On Grid 30KTL 3P with Dongle', 'On Grid 50KTL 3P with Dongle', 'On Grid 115KTL 3P with Dongle', 'On Grid 150KTL 3P with Dongle'],
    'Crown': ['Hybrid Yorker 3.6KW SP', 'Hybrid Yorker 5KW SP', 'Hybrid Yorker 6KW SP', 'Hybrid Nexus 6KW SP', 'Hybrid Nexus 8KW SP', 'Hybrid Nexus 12KW 3P', 'On Grid Nexus 10KW 3P', 'On Grid Nexus 15KW 3P', 'On Grid Nexus 30KW 3P', 'On Grid Nexus 50KW 3P', 'On Grid Nexus 125KW 3P'],
  },
  'Lithium Batteries': {
    'Itel Energy': ['12.8V/100AH', '25.6V/100AH', '25.6V/200AH', '51.2V/100AH', '51.2V/200AH', '51.2V/280AH', '51.2V/314AH'],
    'Inverex': ['12V/100AH', '12V/200AH', '51.2V/100AH', '51.2V/230AH', '51.2V/314AH', 'Power Wall 25.6V/100AH', 'Power Wall 51.2V/100AH', 'Power Wall 51.2V/208AH'],
    'Knox': ['Power Wall 3.0 25.6V/100AH', 'Power Wall 6.0 51.2V/100AH', 'Power Wall 4.15 25.6V/100AH', 'Power Wall 51.2V/100AH', 'Power Base 16 51.2V/314AH', 'Power Base 32 51.2V/314AH'],
    'Dyness': ['DL2.5 25.6V/100AH', 'DL5.0 51.2V/100AH', 'Power Brick 51.2V/280AH', 'Power Brick 51.2V/314AH', 'HV Stack 100'],
    'Goodwe': ['Lynx A G3 51.2V/100AH', 'Lynx D HV 5KWH', 'BAT Series LV 14.3 KWH'],
    'Soluna': ['BES 5K', 'BES 10K'],
    'Pylontech': ['Fidus 51.2V/100AH', 'Fidus 51.2V/314AH'],
    'Sungrow': ['HV SBH100 10KW', 'HV SBH150 15KW', 'HV SBH200 20KW', 'HV SBH250 25KW', 'HV SBH300 30KW', 'HV SBH350 35KW', 'HV SBH400 40KW'],
    'FoxEss': ['EP6', 'EP12'],
    'Fronus/Solax': ['LD51 5.12KWH', 'LD52 5.12KWH', 'LD55 5.12KWH'],
    'Fronus': ['Titan 25.6V/100AH', 'Titan 51.2V/100AH', 'Titan 51.2V/300AH'],
    'Ziewnic': ['Li Wall 25.6V/100AH', 'Li Wall 51.2V/100AH', 'Z-Box 51.2V/280AH'],
    'Luminay/Sunwooda': ['51.2V/100AH', '51.2V/280AH'],
    'Coretech/Sunwooda': ['51.2V/100AH'],
    'Sunwooda': ['51.2V/100AH'],
    'Crown': ['Eleckta Boost 25.6V/100AH', 'Eleckta Boost 51.2V/100AH'],
    'INVT': ['51.2V/100AH'],
    'EVE': ['51.2V/100AH'],
    'Dongjin': ['12.8V/100AH', '25.6V/100AH', '51.2V/100AH'],
    'Narada': ['NESR 51.2V/100AH'],
    'Nova': ['12.8V/100AH IP65', '25.6V/100AH IP65', '25.6V/100AH IP20', '51.2V/100AH IP20'],
  },
  'All in One ESS': {
    'Itel Energy': ['Power Tank 500W/1KWh', 'Power Tank 3.6KW/8KWh'],
    'Inverex': ['Balcony 1KW/1KWh', 'Balcony 1KW/2KWh', 'ALL IN ONE ESS 3.6KW/5KWh', 'ALL IN ONE ESS 5KW/5KWh'],
    'Livoltek': ['Hyper 3000 3KW/5KWh', 'Hyper 3680 3.6KW/5KWh', 'Hyper 4600 4.6KW/5KWh', 'Hyper 5000 5KW/5KWh', 'Hyper 6000 6KW/5KWh'],
    'Vaults PowerOX': ['PO1640 1.6KW/4KWh', 'PO3680 3KW/8KWh'],
  },
  'C&I ESS': {
    'Itel Energy': ['50KW + 50KWh'],
    'Goodwe': ['50KW + 50KWh'],
    'Inverex': ['30KW + 30KWh', '50KW + 50KWh', '125KW + 240KWh'],
    'Fox ESS': ['30KW + 30KWh', '50KW + 50KWh', '125KW + 138KWh'],
    'SAJ': ['50KW + 60KWh'],
  }
};

async function seed() {
  for (const [category, brands] of Object.entries(productCatalog)) {
    const cat = await prisma.productCategory.upsert({
      where: { name: category },
      update: {},
      create: { name: category }
    });

    for (const [brandName, products] of Object.entries(brands)) {
      const brand = await prisma.productBrand.upsert({
        where: { name: brandName },
        update: {},
        create: { name: brandName }
      });

      for (const modelName of products) {
        const fullProductName = brandName + " " + modelName;
        
        let product = await prisma.product.findFirst({
          where: { name: fullProductName, category: category, brand: brandName, model: modelName }
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              name: fullProductName,
              category: category,
              brand: brandName,
              model: modelName,
              price: 1000 
            }
          });
        }

        const mapping = await prisma.productMapping.findFirst({
          where: { brandId: brand.id, productName: fullProductName }
        });
        
        if (!mapping) {
          await prisma.productMapping.create({
            data: {
              brandId: brand.id,
              productName: fullProductName
            }
          });
        }
      }
    }
  }
  console.log('Seeding completed.');
}

seed().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
