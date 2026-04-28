import "dotenv/config.js";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const hashedPassword = await bcrypt.hash("password123", 10);

async function main() {
    console.log("Start seeding ...");

    await prisma.booking.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.user.deleteMany();
    
    console.log("Cleared existing data");

    const alice = await prisma.user.create({
        data: {
            name: "Alice Johnson",
            email: "alice@example.com",
            username: "alicej",
            password: hashedPassword,
            role: "HOST",
            phone: "+1-555-123-4567",
            bio: "I'm a passionate traveler and photographer.",
        }
    });
    const bob = await prisma.user.create({
        data: {
            name: "Bob Smith",
            email: "bob@example.com",
            username: "bobs",
            password: hashedPassword,
            role: "GUEST",
            phone: "+1-555-987-6543",
            bio: "I'm a tech enthusiast and software developer.",
        }
    });
    const carol = await prisma.user.create({
        data: {
            name: "Carol Davis",
            email: "carol@example.com",
            username: "carold",
            password: hashedPassword,
            role: "HOST",
            phone: "+1-555-456-7890",
            bio: "I'm a foodie and culinary enthusiast.",
        }
    });
    const dave = await prisma.user.create({
        data: {
            name: "Dave Wilson",
            email: "dave@example.com",
            username: "davew",
            password: hashedPassword,
            role: "GUEST",
            phone: "+1-555-789-0123",
            bio: "I'm a fitness enthusiast and personal trainer.",
        }
    });
    console.log("Created users");
    
    const listing1 = await prisma.listing.create({
    data: {
        title: "Beachfront Villa",
        description: "A luxurious villa on the beach with stunning views.",
        location: "Maldives",
        pricePerNight: 500,
        type: "VILLA",
        guests: 4,
        amenities: ["Pool", "Garden"],
        hostId: alice.id
        }
    });
    const listing2 = await prisma.listing.create({
        data: {
            title: "Mountain Cabin",
            description: "A cozy cabin nestled in the mountains.",
            location: "Nepal",
            pricePerNight: 300,
            type: "CABIN",
            guests: 2,
            amenities: ["Fireplace", "Garden"],
            hostId: bob.id
        }
    });
    const listing3 = await prisma.listing.create({
        data: {
            title: "City Loft",
            description: "A modern loft in the heart of the city.",
            location: "New York",
            pricePerNight: 800,
            type: "VILLA",
            guests: 6,
            amenities: ["Balcony", "Garden"],
            hostId: carol.id
        }
    })
    console.log("Created listings");

    await prisma.booking.create({
        data: {
            checkIn: new Date("2023-09-01"),
            checkOut: new Date("2023-09-05"),
            totalPrice: 1200,
            status: "CONFIRMED",
            guestId: dave.id,
            listingId: listing1.id
        }
    });
    await prisma.booking.create({
        data: {
            checkIn: new Date("2023-09-10"),
            checkOut: new Date("2023-09-15"),
            totalPrice: 900,
            status: "CONFIRMED",
            guestId: alice.id,
            listingId: listing2.id
        }
    });
    console.log("Created bookings");
    console.log(`Seeding finished.`);

}

main ()
  .catch((err) => {
    console.error("seed failed: ", err);
    process.exit(1);
  })
