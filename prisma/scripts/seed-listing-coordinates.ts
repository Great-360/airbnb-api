import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { coordinatesForLocation } from "../location-coordinates.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const listings = await prisma.listing.findMany({
    where: { OR: [{ latitude: null }, { longitude: null }] },
    select: { id: true, location: true, latitude: true, longitude: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const listing of listings) {
    const coords = coordinatesForLocation(listing.location);
    if (!coords) {
      console.warn(`No coordinates for location "${listing.location}" (${listing.id})`);
      skipped++;
      continue;
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: { latitude: coords.latitude, longitude: coords.longitude },
    });
    updated++;
  }

  console.log(`Coordinates seed complete: ${updated} updated, ${skipped} skipped.`);
}

main()
  .catch((err) => {
    console.error("seed-listing-coordinates failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
