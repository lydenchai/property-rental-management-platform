import { prisma } from '../utils/db';
import { UserStatus } from '../../shared/types/enums/user-status.enum';
import { UserRole } from '../../shared/types/enums/user-role.enum';
import { hashPassword } from '../utils/session';

// In-memory fallback store initialized with demo accounts for local development if PostgreSQL is offline
const defaultHash = hashPassword('RentEase123!');
const inMemoryUsers: Array<{
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: Date | null;
  createdAt: Date;
}> = [
  {
    id: 'user-admin-01',
    email: 'admin@rentease.com',
    passwordHash: defaultHash,
    fullName: 'System Administrator',
    phone: '+855-23-888-100',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'user-landlord-01',
    email: 'landlord@rentease.com',
    passwordHash: defaultHash,
    fullName: 'Bunrath Seng',
    phone: '+855-12-888-101',
    role: UserRole.LANDLORD,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'user-tenant-01',
    email: 'tenant@rentease.com',
    passwordHash: defaultHash,
    fullName: 'Sophea Kem',
    phone: '+855-12-345-102',
    role: UserRole.TENANT,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'user-technician-01',
    email: 'technician@rentease.com',
    passwordHash: defaultHash,
    fullName: 'Dara Chhun',
    phone: '+855-16-789-103',
    role: UserRole.TECHNICIAN,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'user-tech-01',
    email: 'alex.rivers@rentease.com',
    passwordHash: defaultHash,
    fullName: 'Vannak Meas',
    phone: '+855-16-789-104',
    role: UserRole.TECHNICIAN,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
  },
];

const inMemorySessions: Map<string, {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
}> = new Map();

export class UserRepository {
  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch {
      // Fallback to in-memory store
      const found = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      return found || null;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true,
        },
      });
    } catch {
      const found = inMemoryUsers.find((u) => u.id === id);
      if (!found) return null;
      return {
        id: found.id,
        email: found.email,
        fullName: found.fullName,
        phone: found.phone,
        role: found.role,
        status: found.status,
        emailVerifiedAt: found.emailVerifiedAt,
        createdAt: found.createdAt,
      };
    }
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string | null;
    role: UserRole;
    status?: UserStatus;
  }) {
    try {
      return await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          role: data.role,
          status: data.status || UserStatus.ACTIVE,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
    } catch {
      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone || null,
        role: data.role,
        status: data.status || UserStatus.ACTIVE,
        emailVerifiedAt: null,
        createdAt: new Date(),
      };
      inMemoryUsers.push(newUser);
      return {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      };
    }
  }

  async createSession(data: {
    id: string;
    userId: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }) {
    try {
      return await prisma.session.create({
        data,
      });
    } catch {
      inMemorySessions.set(data.id, {
        id: data.id,
        userId: data.userId,
        userAgent: data.userAgent || null,
        ipAddress: data.ipAddress || null,
        expiresAt: data.expiresAt,
      });
      return data;
    }
  }

  async findSession(sessionId: string) {
    try {
      return await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              status: true,
            },
          },
        },
      });
    } catch {
      const session = inMemorySessions.get(sessionId);
      if (!session) return null;
      if (new Date() > session.expiresAt) {
        inMemorySessions.delete(sessionId);
        return null;
      }
      const user = inMemoryUsers.find((u) => u.id === session.userId);
      if (!user) return null;
      return {
        ...session,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
        },
      };
    }
  }

  async deleteSession(sessionId: string) {
    try {
      return await prisma.session.delete({
        where: { id: sessionId },
      }).catch(() => null);
    } catch {
      inMemorySessions.delete(sessionId);
      return null;
    }
  }

  async deleteUserSessions(userId: string) {
    try {
      return await prisma.session.deleteMany({
        where: { userId },
      });
    } catch {
      for (const [id, s] of inMemorySessions.entries()) {
        if (s.userId === userId) {
          inMemorySessions.delete(id);
        }
      }
      return { count: 1 };
    }
  }

  async findMany(filter: { role?: UserRole; status?: UserStatus; search?: string } = {}) {
    try {
      const where: any = {};
      if (filter.role) where.role = filter.role;
      if (filter.status) where.status = filter.status;
      return await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      let filtered = [...inMemoryUsers];
      if (filter.role) filtered = filtered.filter((u) => u.role === filter.role);
      if (filter.status) filtered = filtered.filter((u) => u.status === filter.status);
      if (filter.search) {
        const q = filter.search.toLowerCase();
        filtered = filtered.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      return filtered.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        status: u.status,
        emailVerifiedAt: u.emailVerifiedAt,
        createdAt: u.createdAt,
      }));
    }
  }

  async updateStatus(id: string, status: UserStatus) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { status },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
        },
      });
    } catch {
      const u = inMemoryUsers.find((user) => user.id === id);
      if (!u) return null;
      u.status = status;
      return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        status: u.status,
      };
    }
  }
}

export const userRepo = new UserRepository();
export const userRepository = userRepo;
