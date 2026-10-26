import {
  PrismaClient,
  UserRole,
  UserStatus,
  UnitStatus,
  LeaseStatus,
  InvoiceStatus,
  MaintenancePriority,
  MaintenanceStatus,
} from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  console.log('--- Starting RentEase Database Seed ---');

  // 1. Create Default Users for Each Role
  const defaultPasswordHash = hashPassword('RentEase123!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@rentease.com' },
    update: {},
    create: {
      email: 'admin@rentease.com',
      passwordHash: defaultPasswordHash,
      fullName: 'System Administrator',
      phone: '+855-23-888-100',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@rentease.com' },
    update: {},
    create: {
      email: 'landlord@rentease.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Bunrath Seng',
      phone: '+855-12-888-101',
      role: UserRole.LANDLORD,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const tenant = await prisma.user.upsert({
    where: { email: 'tenant@rentease.com' },
    update: {},
    create: {
      email: 'tenant@rentease.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Sophea Kem',
      phone: '+855-12-345-102',
      role: UserRole.TENANT,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: 'technician@rentease.com' },
    update: {},
    create: {
      email: 'technician@rentease.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Dara Chhun',
      phone: '+855-16-789-103',
      role: UserRole.TECHNICIAN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Seeded Users: Admin, Landlord, Tenant, Technician');

  // 2. Create Sample Property & Units
  const existingProperty = await prisma.property.findFirst({
    where: { landlordId: landlord.id, title: 'BKK1 Premier Luxury Residences' },
  });

  let property = existingProperty;
  if (!property) {
    property = await prisma.property.create({
      data: {
        landlordId: landlord.id,
        title: 'BKK1 Premier Luxury Residences',
        description:
          'Modern urban residential complex in the heart of Boeung Keng Kang 1 featuring premier amenities and skyline views.',
        addressLine1: '#45 Street 288, Sangkat Boeung Keng Kang 1',
        city: 'Phnom Penh',
        state: 'Phnom Penh',
        postalCode: '120102',
        country: 'KH',
        amenities: [
          'Swimming Pool',
          'Fitness Center',
          'Underground Parking',
          '24/7 Concierge',
          'High-speed Fiber',
          'Rooftop Sky Lounge',
          'Backup Generator',
        ],
      },
    });
    console.log('Seeded Property: BKK1 Premier Luxury Residences');
  }

  // Create Units
  const unit1 = await prisma.unit.upsert({
    where: {
      propertyId_unitNumber: {
        propertyId: property.id,
        unitNumber: '101A',
      },
    },
    update: {},
    create: {
      propertyId: property.id,
      unitNumber: '101A',
      floor: 1,
      sizeSqFt: 55.0,
      bedrooms: 1,
      bathrooms: 1.0,
      rentAmount: 650.0,
      depositAmount: 650.0,
      status: UnitStatus.OCCUPIED,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      ],
    },
  });

  const unit2 = await prisma.unit.upsert({
    where: {
      propertyId_unitNumber: {
        propertyId: property.id,
        unitNumber: '204B',
      },
    },
    update: {},
    create: {
      propertyId: property.id,
      unitNumber: '204B',
      floor: 2,
      sizeSqFt: 85.0,
      bedrooms: 2,
      bathrooms: 2.0,
      rentAmount: 1100.0,
      depositAmount: 1100.0,
      status: UnitStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      ],
    },
  });

  console.log('Seeded Units: 101A (Occupied), 204B (Available)');

  // Additional Seed Properties
  const propBassac = await prisma.property.upsert({
    where: { id: 'prop-bassac-02' },
    update: {},
    create: {
      id: 'prop-bassac-02',
      landlordId: landlord.id,
      title: 'Bassac Garden Riverside Condominiums',
      description:
        'Prestigious residential community along the Tonle Bassac riverbank, minutes from AEON Mall 1 and Koh Pich.',
      addressLine1: 'National Assembly Street, Sangkat Tonle Bassac',
      city: 'Phnom Penh',
      state: 'Phnom Penh',
      postalCode: '120101',
      country: 'KH',
      amenities: [
        'Tennis Court',
        'Garden Park',
        'Covered Parking',
        'In-unit Laundry',
        '24/7 Security',
        'Children Playground',
      ],
    },
  });

  await prisma.unit.upsert({
    where: {
      propertyId_unitNumber: {
        propertyId: propBassac.id,
        unitNumber: 'BG-12',
      },
    },
    update: {},
    create: {
      propertyId: propBassac.id,
      unitNumber: 'BG-12',
      floor: 1,
      sizeSqFt: 78.0,
      bedrooms: 2,
      bathrooms: 1.0,
      rentAmount: 850.0,
      depositAmount: 850.0,
      status: UnitStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      ],
    },
  });

  const propPeak = await prisma.property.upsert({
    where: { id: 'prop-peak-03' },
    update: {},
    create: {
      id: 'prop-peak-03',
      landlordId: landlord.id,
      title: 'The Peak Luxury Riverfront Suites',
      description:
        'Iconic 55-story luxury residential landmark overlooking the confluence of the Mekong and Bassac Rivers.',
      addressLine1: 'Samdech Hun Sen Park, Sangkat Tonle Bassac',
      city: 'Phnom Penh',
      state: 'Phnom Penh',
      postalCode: '120101',
      country: 'KH',
      amenities: [
        'Sky Infinity Pool',
        'Luxury Spa',
        'Fitness Gym',
        '24/7 Concierge',
        'Underground Parking',
        'Smart Card Access',
      ],
    },
  });

  await prisma.unit.upsert({
    where: {
      propertyId_unitNumber: {
        propertyId: propPeak.id,
        unitNumber: '32A',
      },
    },
    update: {},
    create: {
      propertyId: propPeak.id,
      unitNumber: '32A',
      floor: 32,
      sizeSqFt: 52.0,
      bedrooms: 1,
      bathrooms: 1.0,
      rentAmount: 650.0,
      depositAmount: 650.0,
      status: UnitStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      ],
    },
  });

  const propAngkor = await prisma.property.upsert({
    where: { id: 'prop-angkor-04' },
    update: {},
    create: {
      id: 'prop-angkor-04',
      landlordId: admin.id,
      title: 'Angkor Heritage Parkside Villas',
      description:
        'Charming tropical boutique villas situated along the Siem Reap River, close to downtown heritage sights and pub street.',
      addressLine1: 'Charles de Gaulle Boulevard, Sangkat Svay Dangkum',
      city: 'Siem Reap',
      state: 'Siem Reap',
      postalCode: '17252',
      country: 'KH',
      amenities: [
        'Private Pool',
        'Tropical Garden',
        'Bicycle Parking',
        'Solar Power Backup',
        'Housekeeping',
      ],
    },
  });

  await prisma.unit.upsert({
    where: {
      propertyId_unitNumber: {
        propertyId: propAngkor.id,
        unitNumber: 'Villa-01',
      },
    },
    update: {},
    create: {
      propertyId: propAngkor.id,
      unitNumber: 'Villa-01',
      floor: 1,
      sizeSqFt: 110.0,
      bedrooms: 2,
      bathrooms: 2.0,
      rentAmount: 550.0,
      depositAmount: 550.0,
      status: UnitStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      ],
    },
  });

  console.log('Seeded Additional Properties: Bassac Garden, The Peak, Angkor Heritage');

  // 3. Create Lease for Unit 101A with Tenant Sarah
  const existingLease = await prisma.lease.findFirst({
    where: { unitId: unit1.id, tenantId: tenant.id },
  });

  let lease = existingLease;
  if (!lease) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    lease = await prisma.lease.create({
      data: {
        unitId: unit1.id,
        tenantId: tenant.id,
        landlordId: landlord.id,
        startDate,
        endDate,
        rentAmount: 1650.0,
        depositAmount: 1650.0,
        paymentDueDay: 1,
        status: LeaseStatus.ACTIVE,
        tenantSignedAt: new Date(startDate),
        landlordSignedAt: new Date(startDate),
        termsAndConditions:
          'Standard 12-month residential lease agreement. Rent due on the 1st of each month.',
      },
    });
    console.log('Seeded Active Lease for Unit 101A');
  }

  // 4. Create Sample Invoice
  const existingInvoice = await prisma.invoice.findFirst({
    where: { leaseId: lease.id },
  });

  if (!existingInvoice) {
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);

    const invoice = await prisma.invoice.create({
      data: {
        leaseId: lease.id,
        tenantId: tenant.id,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        amountDue: 1650.0,
        amountPaid: 0.0,
        issueDate,
        dueDate,
        status: InvoiceStatus.UNPAID,
      },
    });
    console.log(`Seeded Invoice: ${invoice.invoiceNumber}`);
  }

  // 5. Create Maintenance Request
  const existingTicket = await prisma.maintenanceRequest.findFirst({
    where: { unitId: unit1.id, tenantId: tenant.id },
  });

  if (!existingTicket) {
    const ticket = await prisma.maintenanceRequest.create({
      data: {
        unitId: unit1.id,
        tenantId: tenant.id,
        title: 'HVAC Air Conditioning Not Cooling',
        description: 'The AC unit is blowing ambient temperature air during peak afternoon hours.',
        priority: MaintenancePriority.HIGH,
        status: MaintenanceStatus.ASSIGNED,
      },
    });

    await prisma.maintenanceAssignment.create({
      data: {
        requestId: ticket.id,
        technicianId: technician.id,
        assignedById: landlord.id,
        status: 'ASSIGNED',
        notes: 'Please inspect the coolant line and exterior compressor unit.',
      },
    });
    console.log('Seeded Maintenance Ticket and Assignment to Technician Dave');
  }

  console.log('--- Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
