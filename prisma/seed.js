import "dotenv/config.js";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
;
async function main() {
    console.log("Start seeding ...");
    await prisma.booking.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.user.deleteMany();
    console.log("Cleae");
}
//# sourceMappingURL=seed.js.map