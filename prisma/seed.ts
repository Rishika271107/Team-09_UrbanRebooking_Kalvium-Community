import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.rebookHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.address.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      fullName: 'Sarah Johnson',
      email: 'customer@urban.co',
      hashedPassword: passwordHash,
      phone: '+1 234 567 8900',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      label: 'Customer',
    }
  });

  // Create Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: user.id,
      addressLine: '123 Main St, Apt 4B',
      city: 'New York',
      state: 'NY',
      pincode: '10001',
      isDefault: true,
    }
  });

  const address2 = await prisma.address.create({
    data: {
      userId: user.id,
      addressLine: '456 Office Blvd, Floor 12',
      city: 'New York',
      state: 'NY',
      pincode: '10002',
      isDefault: false,
    }
  });

  // Create Professionals
  const pro1 = await prisma.professional.create({
    data: {
      name: 'Michael Chen',
      avatar: 'https://i.pravatar.cc/150?u=michael',
      rating: 4.9,
      jobsCompleted: 342,
      experience: '5 years',
      category: 'Cleaning',
    }
  });

  const pro2 = await prisma.professional.create({
    data: {
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?u=emma',
      rating: 4.8,
      jobsCompleted: 156,
      experience: '3 years',
      category: 'Beauty',
    }
  });

  // Create Services
  const service1 = await prisma.service.create({
    data: {
      name: 'Intense Deep Cleaning',
      description: 'Complete home deep cleaning',
      startingPrice: 129,
      icon: 'Sparkles',
      category: 'Cleaning',
      color: 'bg-blue-100 text-blue-600',
    }
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'AC Servicing & Repair',
      description: 'Professional AC maintenance',
      startingPrice: 49,
      icon: 'Wind',
      category: 'Repair',
      color: 'bg-cyan-100 text-cyan-600',
    }
  });

  // Create Bookings
  const upcomingBooking = await prisma.booking.create({
    data: {
      serviceId: service1.id,
      professionalId: pro1.id,
      customerId: user.id,
      addressId: address1.id,
      date: 'Tomorrow',
      time: '10:00 AM',
      status: 'UPCOMING',
      price: 129,
    }
  });

  // Create completed bookings
  for (let i = 0; i < 7; i++) {
    await prisma.booking.create({
      data: {
        serviceId: i % 2 === 0 ? service1.id : service2.id,
        professionalId: i % 2 === 0 ? pro1.id : pro2.id,
        customerId: user.id,
        addressId: address1.id,
        date: `Oct ${10 + i}, 2023`,
        time: '2:00 PM',
        status: 'COMPLETED',
        price: i % 2 === 0 ? 129 : 49,
      }
    });
  }

  // Create Activities
  await prisma.activity.create({
    data: {
      userId: user.id,
      title: 'Booking Completed',
      description: 'Intense Deep Cleaning was completed',
      type: 'BOOKING_COMPLETED',
      professionalName: 'Michael Chen',
      date: '2 hours ago',
    }
  });

  // Create Notifications
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Booking Confirmed',
      message: 'Your deep cleaning service is confirmed for Tomorrow at 10:00 AM.',
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
