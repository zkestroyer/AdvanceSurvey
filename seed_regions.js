const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = {
  "South Region (Sindh)": [
    "Karachi", "Hyderabad", "Sukkur", "Larkana", "Mirpurkhas", "Nawabshah (Shaheed Benazirabad)",
    "Jacobabad", "Shikarpur", "Khairpur", "Ghotki", "Dadu", "Jamshoro", "Thatta", "Badin",
    "Tando Allahyar", "Tando Muhammad Khan", "Matiari", "Umerkot", "Sanghar", "Kashmore",
    "Kandhkot", "Tharparkar (Mithi)", "Sehwan", "Kotri", "Rohri", "Pano Aqil", "Moro", "Ratodero"
  ],
  "Central Region (Punjab)": [
    "Lahore", "Faisalabad", "Multan", "Rawalpindi", "Gujranwala", "Sialkot", "Gujrat", "Sargodha",
    "Bahawalpur", "Bahawalnagar", "Rahim Yar Khan", "Dera Ghazi Khan", "Muzaffargarh", "Khanewal",
    "Vehari", "Sahiwal", "Okara", "Pakpattan", "Kasur", "Sheikhupura", "Nankana Sahib", "Hafizabad",
    "Mandi Bahauddin", "Jhelum", "Attock", "Chakwal", "Mianwali", "Bhakkar", "Khushab", "Toba Tek Singh",
    "Chiniot", "Jhang", "Lodhran", "Layyah", "Narowal"
  ],
  "North Region (Khyber Pakhtunkhwa + Islamabad)": [
    "Islamabad", "Peshawar", "Mardan", "Swabi", "Nowshera", "Charsadda", "Abbottabad", "Haripur",
    "Mansehra", "Battagram", "Kohistan", "Swat (Mingora)", "Buner", "Shangla", "Malakand", "Lower Dir",
    "Upper Dir", "Chitral Lower", "Chitral Upper", "Kohat", "Hangu", "Karak", "Bannu", "Lakki Marwat",
    "Dera Ismail Khan", "Tank", "Timergara", "Batkhela"
  ],
  "West Region (Balochistan)": [
    "Quetta", "Gwadar", "Turbat", "Khuzdar", "Hub", "Lasbela", "Chaman", "Zhob", "Sibi", "Loralai",
    "Pishin", "Mastung", "Kalat", "Nushki", "Kharan", "Panjgur", "Washuk", "Dera Murad Jamali",
    "Jaffarabad", "Usta Muhammad", "Barkhan", "Musa Khel", "Qila Saifullah", "Qila Abdullah"
  ],
  "Azad Jammu & Kashmir (AJK)": [
    "Muzaffarabad", "Mirpur", "Kotli", "Bhimber", "Bagh", "Rawalakot", "Haveli", "Hattian Bala",
    "Neelum", "Sudhanoti"
  ],
  "Gilgit-Baltistan (GB)": [
    "Gilgit", "Skardu", "Hunza", "Nagar", "Ghizer", "Gupis", "Astore", "Diamer (Chilas)", "Shigar",
    "Kharmang", "Roundu"
  ]
};

async function main() {
  for (const [regionName, cities] of Object.entries(data)) {
    console.log(`Processing region: ${regionName}`);
    let region = await prisma.region.findUnique({ where: { name: regionName } });
    if (!region) {
      region = await prisma.region.create({ data: { name: regionName } });
    }
    
    for (const cityName of cities) {
      const existingCity = await prisma.city.findFirst({
        where: { name: cityName, regionId: region.id }
      });
      if (!existingCity) {
        await prisma.city.create({
          data: { name: cityName, regionId: region.id }
        });
        console.log(`  Added city: ${cityName}`);
      }
    }
  }
  console.log("Seeding complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
