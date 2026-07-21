import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const customer = await prisma.user.upsert({
    where: { email: "customer@urban.co" },
    update: {},
    create: {
      name: "Asha Kumar",
      email: "customer@urban.co",
      phone: "+91 98765 43210",
      password,
      role: "CUSTOMER",
      address: "12 MG Road, Bengaluru",
    },
  });

  const proUser = await prisma.user.upsert({
    where: { email: "pro@urban.co" },
    update: {},
    create: {
      name: "Ravi Shankar",
      email: "pro@urban.co",
      phone: "+91 98765 11111",
      password,
      role: "PROFESSIONAL",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@urban.co" },
    update: {},
    create: {
      name: "Urban Admin",
      email: "admin@urban.co",
      phone: "+91 98765 22222",
      password,
      role: "ADMIN",
    },
  });

  const professional = await prisma.professional.upsert({
    where: { userId: proUser.id },
    update: {},
    create: {
      userId: proUser.id,
      skills: ["AC Repair", "Deep Cleaning", "Plumbing"],
      active: true,
      rating: 4.8,
    },
  });

  const service = await prisma.service.upsert({
    where: { id: "seed-service-ac-repair" },
    update: {},
    create: {
      id: "seed-service-ac-repair",
      name: "AC Repair & Service",
      category: "Appliance Repair",
      price: 499,
      durationMinutes: 60,
    },
  });

  // A completed past booking so the "Rebook" action has something to act on.
  await prisma.booking.upsert({
    where: { id: "seed-booking-completed-1" },
    update: {},
    create: {
      id: "seed-booking-completed-1",
      userId: customer.id,
      professionalId: professional.id,
      serviceId: service.id,
      address: customer.address,
      slotStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      slotEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      status: "COMPLETED",
    },
  });

  // Generate an hourly calendar grid (9am-6pm UTC) for the professional over
  // the next 3 days, with one blocked hour per day, so the availability
  // endpoint and slot picker have real data to work with.
  for (let day = 0; day < 3; day++) {
    const base = new Date();
    base.setUTCHours(0, 0, 0, 0);
    base.setUTCDate(base.getUTCDate() + day);

    for (let hour = 9; hour < 18; hour++) {
      const start = new Date(base);
      start.setUTCHours(hour, 0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const isBlocked = hour === 13; // lunch break

      await prisma.calendarSlot.upsert({
        where: {
          professionalId_startTime: { professionalId: professional.id, startTime: start },
        },
        update: {},
        create: {
          professionalId: professional.id,
          startTime: start,
          endTime: end,
          slotType: isBlocked ? "BLOCKED" : "AVAILABLE",
        },
      });
    }
  }

  // Seed one rebooking event so /admin/analytics has something to chart
  // before anyone has clicked "Rebook" for real.
  await prisma.rebookingEvent.upsert({
    where: { id: "seed-rebooking-event-1" },
    update: {},
    create: {
      id: "seed-rebooking-event-1",
      sourceBookingId: "seed-booking-completed-1",
      outcome: "SUCCESS",
    },
  });

  console.log("Seed complete. Demo accounts (password: password123):");
  console.log("  customer@urban.co");
  console.log("  pro@urban.co");
  console.log("  admin@urban.co");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
