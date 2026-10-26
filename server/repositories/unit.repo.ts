import { prisma } from '../utils/db';
import { UnitStatus } from '../../shared/types/enums/unit-status.enum';
import { CreateUnitInput, UpdateUnitInput } from '../../shared/schemas/property.schema';

export interface UnitEntity {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  sizeSqFt: number;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  depositAmount: number;
  status: UnitStatus;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  property?: {
    id: string;
    title: string;
    city: string;
    state: string;
    landlordId: string;
  };
}

const inMemoryUnits: UnitEntity[] = [
  {
    id: 'unit-skyline-101a',
    propertyId: 'prop-skyline-01',
    unitNumber: '101A',
    floor: 1,
    sizeSqFt: 55,
    bedrooms: 1,
    bathrooms: 1.0,
    rentAmount: 650,
    depositAmount: 650,
    status: UnitStatus.OCCUPIED,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-01-16T10:00:00Z'),
    updatedAt: new Date('2026-01-16T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-skyline-204b',
    propertyId: 'prop-skyline-01',
    unitNumber: '204B',
    floor: 2,
    sizeSqFt: 85,
    bedrooms: 2,
    bathrooms: 2.0,
    rentAmount: 1100,
    depositAmount: 1100,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-01-18T11:00:00Z'),
    updatedAt: new Date('2026-01-18T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-skyline-305c',
    propertyId: 'prop-skyline-01',
    unitNumber: '305C',
    floor: 3,
    sizeSqFt: 130,
    bedrooms: 3,
    bathrooms: 2.5,
    rentAmount: 1700,
    depositAmount: 1700,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-01-20T09:30:00Z'),
    updatedAt: new Date('2026-01-20T09:30:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-oakwood-12',
    propertyId: 'prop-oakwood-02',
    unitNumber: '12',
    floor: 1,
    sizeSqFt: 78,
    bedrooms: 2,
    bathrooms: 1.0,
    rentAmount: 850,
    depositAmount: 850,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-02-02T12:00:00Z'),
    updatedAt: new Date('2026-02-02T12:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-metropolitan-401',
    propertyId: 'prop-metropolitan-03',
    unitNumber: '401',
    floor: 4,
    sizeSqFt: 60,
    bedrooms: 1,
    bathrooms: 1.0,
    rentAmount: 450,
    depositAmount: 450,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1502005229762-ee1b40280f5c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-02-11T15:00:00Z'),
    updatedAt: new Date('2026-02-11T15:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-peak-32a',
    propertyId: 'prop-peak-04',
    unitNumber: '32A',
    floor: 32,
    sizeSqFt: 52,
    bedrooms: 1,
    bathrooms: 1.0,
    rentAmount: 650,
    depositAmount: 650,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-02-16T10:00:00Z'),
    updatedAt: new Date('2026-02-16T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-peak-45b',
    propertyId: 'prop-peak-04',
    unitNumber: '45B',
    floor: 45,
    sizeSqFt: 96,
    bedrooms: 2,
    bathrooms: 2.0,
    rentAmount: 1250,
    depositAmount: 1250,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-02-16T10:00:00Z'),
    updatedAt: new Date('2026-02-16T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-tk-01',
    propertyId: 'prop-toulkork-05',
    unitNumber: 'Villa TK-01',
    floor: 1,
    sizeSqFt: 280,
    bedrooms: 4,
    bathrooms: 4.5,
    rentAmount: 2200,
    depositAmount: 2200,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-02-21T12:00:00Z'),
    updatedAt: new Date('2026-02-21T12:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-chroy-801',
    propertyId: 'prop-chroy-06',
    unitNumber: '801',
    floor: 8,
    sizeSqFt: 76,
    bedrooms: 2,
    bathrooms: 2.0,
    rentAmount: 750,
    depositAmount: 750,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-03-02T09:00:00Z'),
    updatedAt: new Date('2026-03-02T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-otres-502',
    propertyId: 'prop-otres-07',
    unitNumber: 'PB-502',
    floor: 5,
    sizeSqFt: 42,
    bedrooms: 1,
    bathrooms: 1.0,
    rentAmount: 450,
    depositAmount: 450,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-03-06T11:00:00Z'),
    updatedAt: new Date('2026-03-06T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'unit-kampot-01',
    propertyId: 'prop-kampot-08',
    unitNumber: 'Villa KH-01',
    floor: 1,
    sizeSqFt: 110,
    bedrooms: 2,
    bathrooms: 2.0,
    rentAmount: 550,
    depositAmount: 550,
    status: UnitStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    createdAt: new Date('2026-03-11T14:00:00Z'),
    updatedAt: new Date('2026-03-11T14:00:00Z'),
    deletedAt: null,
  },
];

export class UnitRepository {
  async create(propertyId: string, input: CreateUnitInput): Promise<UnitEntity> {
    try {
      const created = await prisma.unit.create({
        data: {
          propertyId,
          unitNumber: input.unitNumber,
          floor: input.floor,
          sizeSqFt: input.sizeSqFt,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          rentAmount: input.rentAmount,
          depositAmount: input.depositAmount,
          status: (input.status as any) || UnitStatus.AVAILABLE,
          images: [],
        },
      });
      return {
        ...created,
        sizeSqFt: Number(created.sizeSqFt),
        bathrooms: Number(created.bathrooms),
        rentAmount: Number(created.rentAmount),
        depositAmount: Number(created.depositAmount),
        status: created.status as UnitStatus,
        images: (created.images as string[]) || [],
      };
    } catch {
      const newUnit: UnitEntity = {
        id: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        propertyId,
        unitNumber: input.unitNumber,
        floor: input.floor,
        sizeSqFt: input.sizeSqFt,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        rentAmount: input.rentAmount,
        depositAmount: input.depositAmount,
        status: (input.status as UnitStatus) || UnitStatus.AVAILABLE,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      inMemoryUnits.push(newUnit);
      return newUnit;
    }
  }

  async findById(id: string): Promise<UnitEntity | null> {
    try {
      const unit = await prisma.unit.findFirst({
        where: { id, deletedAt: null },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              state: true,
              landlordId: true,
            },
          },
        },
      });
      if (!unit) return null;
      return {
        ...unit,
        sizeSqFt: Number(unit.sizeSqFt),
        bathrooms: Number(unit.bathrooms),
        rentAmount: Number(unit.rentAmount),
        depositAmount: Number(unit.depositAmount),
        status: unit.status as UnitStatus,
        images: (unit.images as string[]) || [],
      };
    } catch {
      const found = inMemoryUnits.find((u) => u.id === id && !u.deletedAt);
      return found ? { ...found } : null;
    }
  }

  async findByPropertyId(propertyId: string): Promise<UnitEntity[]> {
    try {
      const units = await prisma.unit.findMany({
        where: { propertyId, deletedAt: null },
        orderBy: { unitNumber: 'asc' },
      });
      return units.map((u) => ({
        ...u,
        sizeSqFt: Number(u.sizeSqFt),
        bathrooms: Number(u.bathrooms),
        rentAmount: Number(u.rentAmount),
        depositAmount: Number(u.depositAmount),
        status: u.status as UnitStatus,
        images: (u.images as string[]) || [],
      }));
    } catch {
      return inMemoryUnits.filter((u) => u.propertyId === propertyId && !u.deletedAt);
    }
  }

  async findAll(
    filter: {
      propertyId?: string;
      status?: UnitStatus;
      minRent?: number;
      maxRent?: number;
      bedrooms?: number;
    } = {}
  ): Promise<UnitEntity[]> {
    try {
      const where: any = { deletedAt: null };
      if (filter.propertyId) where.propertyId = filter.propertyId;
      if (filter.status) where.status = filter.status;
      if (filter.bedrooms !== undefined) where.bedrooms = filter.bedrooms;
      if (filter.minRent !== undefined || filter.maxRent !== undefined) {
        where.rentAmount = {};
        if (filter.minRent !== undefined) where.rentAmount.gte = filter.minRent;
        if (filter.maxRent !== undefined) where.rentAmount.lte = filter.maxRent;
      }

      const units = await prisma.unit.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              state: true,
              landlordId: true,
            },
          },
        },
        orderBy: { rentAmount: 'asc' },
      });

      return units.map((u) => ({
        ...u,
        sizeSqFt: Number(u.sizeSqFt),
        bathrooms: Number(u.bathrooms),
        rentAmount: Number(u.rentAmount),
        depositAmount: Number(u.depositAmount),
        status: u.status as UnitStatus,
        images: (u.images as string[]) || [],
      }));
    } catch {
      return inMemoryUnits.filter((u) => {
        if (u.deletedAt) return false;
        if (filter.propertyId && u.propertyId !== filter.propertyId) return false;
        if (filter.status && u.status !== filter.status) return false;
        if (filter.bedrooms !== undefined && u.bedrooms !== filter.bedrooms) return false;
        if (filter.minRent !== undefined && u.rentAmount < filter.minRent) return false;
        if (filter.maxRent !== undefined && u.rentAmount > filter.maxRent) return false;
        return true;
      });
    }
  }

  async update(id: string, input: UpdateUnitInput): Promise<UnitEntity | null> {
    try {
      const updated = await prisma.unit.update({
        where: { id },
        data: {
          ...(input.unitNumber && { unitNumber: input.unitNumber }),
          ...(input.floor !== undefined && { floor: input.floor }),
          ...(input.sizeSqFt !== undefined && { sizeSqFt: input.sizeSqFt }),
          ...(input.bedrooms !== undefined && { bedrooms: input.bedrooms }),
          ...(input.bathrooms !== undefined && { bathrooms: input.bathrooms }),
          ...(input.rentAmount !== undefined && { rentAmount: input.rentAmount }),
          ...(input.depositAmount !== undefined && { depositAmount: input.depositAmount }),
          ...(input.status && { status: input.status as any }),
        },
      });
      return {
        ...updated,
        sizeSqFt: Number(updated.sizeSqFt),
        bathrooms: Number(updated.bathrooms),
        rentAmount: Number(updated.rentAmount),
        depositAmount: Number(updated.depositAmount),
        status: updated.status as UnitStatus,
        images: (updated.images as string[]) || [],
      };
    } catch {
      const idx = inMemoryUnits.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      inMemoryUnits[idx] = {
        ...inMemoryUnits[idx],
        ...input,
        status: (input.status as UnitStatus) || inMemoryUnits[idx].status,
        updatedAt: new Date(),
      };
      return inMemoryUnits[idx];
    }
  }

  async updateStatus(id: string, status: UnitStatus | string): Promise<UnitEntity | null> {
    return this.update(id, { status: status as UnitStatus });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.unit.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      const unit = inMemoryUnits.find((u) => u.id === id);
      if (!unit) return false;
      unit.deletedAt = new Date();
      return true;
    }
  }
}

export const unitRepo = new UnitRepository();
export const unitRepository = unitRepo;
