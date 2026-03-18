import { mockUsers } from '../data/seed-data.ts';
import type { User, RegisterDTO, LoginDTO, AuthResponse } from '../types/user.ts';

export class AuthService {
  static async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existing = mockUsers.find(u => u.email === dto.email);
    if (existing) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: 'u' + (mockUsers.length + 1).toString(),
      email: dto.email,
      passwordHash: 'hashed_' + dto.password, // Simple hash for demo
      displayName: dto.displayName,
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    const { passwordHash, ...user } = newUser;
    return {
      user,
      token: 'mock-token-' + user.id,
    };
  }

  static async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = mockUsers.find(u => u.email === dto.email);
    if (!user || user.passwordHash !== 'hashed_' + dto.password) {
      throw new Error('Invalid email or password');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: 'mock-token-' + user.id,
    };
  }

  static async getMe(token: string): Promise<Omit<User, 'passwordHash'>> {
    const userId = token.replace('mock-token-', '');
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
