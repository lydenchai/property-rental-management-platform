import { prisma } from '../utils/db';
import { CreatePropertyInput, UpdatePropertyInput } from '../../shared/schemas/property.schema';

export interface PropertyEntity {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  amenities: string[];
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  units?: any[];
  landlord?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
}

// Initial in-memory seed properties for development resilience
const inMemoryProperties: PropertyEntity[] = [
  {
    id: 'prop-skyline-01',
    landlordId: 'user-landlord-01',
    title: 'BKK1 Premier Luxury Residences',
    description: 'Modern urban residential high-rise complex in the heart of Boeung Keng Kang 1. Features rooftop infinity pool, skyline lounge, 24/7 security concierge, and high-speed fiber.',
    addressLine1: '#45 Street 288, Sangkat Boeung Keng Kang 1',
    city: 'Phnom Penh',
    state: 'Phnom Penh',
    postalCode: '120102',
    country: 'KH',
    latitude: 11.5516,
    longitude: 104.9224,
    amenities: ['Swimming Pool', 'Fitness Center', 'Underground Parking', '24/7 Concierge', 'High-speed Fiber', 'Rooftop Lounge', 'Backup Generator'],
    createdAt: new Date('2026-01-15T08:00:00Z'),
    updatedAt: new Date('2026-01-15T08:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'prop-oakwood-02',
    landlordId: 'user-landlord-01',
    title: 'Bassac Garden Riverside Condominiums',
    description: 'Prestigious residential community along the Tonle Bassac riverbank, minutes from AEON Mall 1 and Koh Pich. Landscaped gardens, lap pool, and 24-hour guarded gate.',
    addressLine1: 'National Assembly Street, Sangkat Tonle Bassac',
    city: 'Phnom Penh',
    state: 'Phnom Penh',
    postalCode: '120101',
    country: 'KH',
    latitude: 11.5458,
    longitude: 104.9352,
    amenities: ['Tennis Court', 'Garden Park', 'Covered Parking', 'In-unit Laundry', '24/7 Security', 'Children Playground'],
    createdAt: new Date('2026-02-01T10:30:00Z'),
    updatedAt: new Date('2026-02-01T10:30:00Z'),
    deletedAt: null,
  },
  {
    id: 'prop-metropolitan-03',
    landlordId: 'user-admin-01',
    title: 'Angkor Heritage Parkside Villas',
    description: 'Charming tropical boutique villas situated along the Siem Reap River, close to downtown heritage sights, pub street, and airport gateway.',
    addressLine1: 'Charles de Gaulle Boulevard, Sangkat Svay Dangkum',
    city: 'Siem Reap',
    state: 'Siem Reap',
    postalCode: '17252',
    country: 'KH',
    latitude: 13.3671,
    longitude: 103.8590,
    amenities: ['Private Pool', 'Tropical Garden', 'Bicycle Parking', 'Solar Power Backup', 'Housekeeping'],
    createdAt: new Date('2026-02-10T14:15:00Z'),
    updatedAt: new Date('2026-02-10T14:15:00Z'),
    deletedAt: null,
  },
  {
    id: 'prop-peak-04',
    landlordId: 'user-landlord-01',
    title: 'The Peak Luxury Riverfront Suites',
    description: 'Iconic 55-story luxury residential landmark overlooking the confluence of the Mekong and Bassac Rivers. Features Shangri-La hotel amenities, infinity sky pool, and direct mall access.',
    addressLine1: 'Samdech Hun Sen Park, Sangkat Tonle Bassac, Khan Chamkarmon',
    city: 'Phnom Penh',
    state: 'Phnom Penh',
    postalCode: '120101',
    country: 'KH',
    latitude: 11.5528,
    longitude: 104.9388,
    amenities: ['Sky Infinity Pool', 'Luxury Spa', 'Fitness Gym', '24/7 Concierge', 'Underground Parking', 'Smart Card Access', 'Rooftop Bar'],
    createdAt: new Date('2026-02-15T09:00:00Z'),
    updatedAt: new Date('2026-02-15T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'prop-toulkork-05',
    landlordId: 'user-landlord-01',
    title: 'Toul Kork Greenery Garden Villas',
    description: 'Exclusive private gated compound nestled in Toul Kork diplomatic precinct. Expansive outdoor entertaining patios, private swimming pools, and manicured tropical grounds.',
    addressLine1: 'Street 315, Sangkat Boeung Kak 1, Khan Toul Kork',
    city: 'Phnom Penh',
    state: 'Phnom Penh',
    postalCode: '120407',
    country: 'KH',
    latitude: 11.5762,
    longitude: 104.8967,
    amenities: ['Private Pool', 'Solar Energy Backup', '24/7 Guarded Gate', 'Private Garage', 'Garden Patio', 'CCTV Security'],
    createdAt: new Date('2026-02-20T11:30:00Z'),
    updatedAt: new Date('2026-02-20T11:30:00Z'),
    deletedAt: null,
  },
  {
    id: 'prop-chroy-06',
    landlordId: 'user-admin-01',
    title: 'Chroy Changvar Riverside Horizons',
    description: 'Scenic peninsula waterfront community with panoramic sunrise views over the Tonle Sap. Breeze-cooled balconies, Olympic-size lap pool, and riverfront boardwalk.',
    addressLine1: 'Keo Chenda Street, Sangkat Chroy Changvar, Khan Chroy Changvar',
    city: 'Phnom Penh',
    state: 'Phnom Penh',
    postalCode: '121101',
    country: 'KH',
    latitude: 11.5878,
    longitude: 104.9312,
    amenities: ['Olympic Pool', 'Riverfront Boardwalk', 'Tennis Court', 'Covered Parking', 'Kids Playground', 'High-speed Fiber'],
    createdAt: new Date('2026-03-01T08:00:00Z'),
    updatedAt: new Date('2026-03-01T08:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'prop-otres-07',
    landlordId: 'user-landlord-01',
    title: 'Sihanoukville Pearl Bay Ocean Condos',
    description: 'Breathtaking beachfront condominium residences directly facing the Gulf of Thailand. Sunset sea views, private beach club access, and tropical resort amenities.',
    addressLine1: 'Otres Beach Parkway, Sangkat 4',
    city: 'Sihanoukville',
    state: 'Preah Sihanouk',
    postalCode: '180104',
    country: 'KH',
    latitude: 10.5758,
    longitude: 103.5512,
    amenities: ['Beach Access', 'Oceanfront Pool', 'Sunset Terrace', 'Fitness Club', '24/7 Security', 'Beachside Cafe'],
    createdAt: new Date('2026-03-05T10:00:00Z'),
    updatedAt: new Date('2026-03-05T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'prop-kampot-08',
    landlordId: 'user-admin-01',
    title: 'Kampot Riverfront Heritage Estate',
    description: 'Boutique French-Indochine style riverside sanctuary framed by the Bokor Mountain range. Tranquil garden setting with private wooden boat jetty and kayak launch.',
    addressLine1: 'Riverside Road, Krong Kampot',
    city: 'Kampot',
    state: 'Kampot',
    postalCode: '070101',
    country: 'KH',
    latitude: 10.6085,
    longitude: 104.1818,
    amenities: ['Private Boat Jetty', 'Kayak Launch', 'Tropical Fruit Garden', 'Solar Water Heating', 'High-speed Fiber'],
    createdAt: new Date('2026-03-10T12:00:00Z'),
    updatedAt: new Date('2026-03-10T12:00:00Z'),
    deletedAt: null,
  },
];

export class PropertyRepository {
  async create(landlordId: string, input: CreatePropertyInput): Promise<PropertyEntity> {
    try {
      const created = await prisma.property.create({
        data: {
          landlordId,
          title: input.title,
          description: input.description,
          addressLine1: input.addressLine1,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country || 'KH',
          amenities: input.amenities,
        },
      });
      return {
        ...created,
        amenities: (created.amenities as string[]) || [],
      };
    } catch {
      const newProp: PropertyEntity = {
        id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        landlordId,
        title: input.title,
        description: input.description,
        addressLine1: input.addressLine1,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country || 'KH',
        amenities: input.amenities || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      inMemoryProperties.unshift(newProp);
      return newProp;
    }
  }

  async findById(id: string): Promise<PropertyEntity | null> {
    try {
      const prop = await prisma.property.findFirst({
        where: { id, deletedAt: null },
        include: {
          landlord: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          units: {
            where: { deletedAt: null },
            orderBy: { unitNumber: 'asc' },
          },
        },
      });
      if (!prop) return null;
      return {
        ...prop,
        amenities: (prop.amenities as string[]) || [],
      };
    } catch {
      const found = inMemoryProperties.find((p) => p.id === id && !p.deletedAt);
      if (!found) return null;
      return { ...found };
    }
  }

  async findAll(filter: {
    landlordId?: string;
    city?: string;
    state?: string;
    search?: string;
  } = {}): Promise<PropertyEntity[]> {
    try {
      const where: any = { deletedAt: null };
      if (filter.landlordId) where.landlordId = filter.landlordId;
      if (filter.city) where.city = { contains: filter.city, mode: 'insensitive' };
      if (filter.state) where.state = { contains: filter.state, mode: 'insensitive' };
      if (filter.search) {
        where.OR = [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { addressLine1: { contains: filter.search, mode: 'insensitive' } },
          { city: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      const list = await prisma.property.findMany({
        where,
        include: {
          units: {
            where: { deletedAt: null },
          },
          landlord: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return list.map((p: any) => ({
        ...p,
        amenities: (p.amenities as string[]) || [],
      }));
    } catch {
      return inMemoryProperties.filter((p) => {
        if (p.deletedAt) return false;
        if (filter.landlordId && p.landlordId !== filter.landlordId) return false;
        if (filter.city && !p.city.toLowerCase().includes(filter.city.toLowerCase())) return false;
        if (filter.state && !p.state.toLowerCase().includes(filter.state.toLowerCase())) return false;
        if (filter.search) {
          const q = filter.search.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchAddress = p.addressLine1.toLowerCase().includes(q);
          const matchCity = p.city.toLowerCase().includes(q);
          if (!matchTitle && !matchAddress && !matchCity) return false;
        }
        return true;
      });
    }
  }

  async findMany(filter: {
    landlordId?: string;
    city?: string;
    state?: string;
    search?: string;
  } = {}): Promise<PropertyEntity[]> {
    return this.findAll(filter);
  }

  async update(id: string, input: UpdatePropertyInput): Promise<PropertyEntity | null> {
    try {
      const updated = await prisma.property.update({
        where: { id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.description && { description: input.description }),
          ...(input.addressLine1 && { addressLine1: input.addressLine1 }),
          ...(input.city && { city: input.city }),
          ...(input.state && { state: input.state }),
          ...(input.postalCode && { postalCode: input.postalCode }),
          ...(input.country && { country: input.country }),
          ...(input.amenities && { amenities: input.amenities }),
        },
      });
      return {
        ...updated,
        amenities: (updated.amenities as string[]) || [],
      };
    } catch {
      const idx = inMemoryProperties.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      inMemoryProperties[idx] = {
        ...inMemoryProperties[idx],
        ...(input as any),
        amenities: input.amenities || inMemoryProperties[idx]!.amenities,
        updatedAt: new Date(),
      };
      return inMemoryProperties[idx]!;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.property.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      const prop = inMemoryProperties.find((p) => p.id === id);
      if (!prop) return false;
      prop.deletedAt = new Date();
      return true;
    }
  }
}

export const propertyRepo = new PropertyRepository();
export const propertyRepository = propertyRepo;
