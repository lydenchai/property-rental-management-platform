import { userRepo } from '../repositories/user.repo';
import { hashPassword, verifyPassword, generateSessionId } from '../utils/session';
import { RegisterInput, LoginInput } from '../../shared/schemas/auth.schema';
import { badRequestError, unauthorizedError, forbiddenError } from '../utils/errors';
import { UserRole } from '~~/shared/types/enums/user-role.enum';


const SESSION_DURATION_DAYS = 7;

export class AuthService {
  async register(
    input: RegisterInput,
    metadata: { ipAddress?: string | null; userAgent?: string | null }
  ) {
    const existingUser = await userRepo.findByEmail(input.email);
    if (existingUser) {
      throw badRequestError('An account with this email address already exists');
    }

    const passwordHash = hashPassword(input.password);
    const user = await userRepo.createUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role as UserRole,
      status: 'ACTIVE',
    });

    const sessionId = generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    await userRepo.createSession({
      id: sessionId,
      userId: user.id,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      expiresAt,
    });

    return {
      user,
      sessionId,
    };
  }

  async login(
    input: LoginInput,
    metadata: { ipAddress?: string | null; userAgent?: string | null }
  ) {
    const user = await userRepo.findByEmail(input.email);
    if (!user) {
      throw unauthorizedError('Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw forbiddenError('Your account has been suspended. Please contact support.');
    }

    const isPasswordValid = verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw unauthorizedError('Invalid email or password');
    }

    const sessionId = generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    await userRepo.createSession({
      id: sessionId,
      userId: user.id,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      sessionId,
    };
  }

  async logout(sessionId: string) {
    await userRepo.deleteSession(sessionId);
  }

  async getProfile(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw unauthorizedError('User not found');
    }
    return user;
  }
}

export const authService = new AuthService();
