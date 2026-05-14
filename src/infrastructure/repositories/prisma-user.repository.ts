import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { UserEntity, CreateUserInput, UpdateUserInput } from '../../domain/entities/user.entity';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll(page = 1, limit = 50): Promise<UserEntity[]> {
    const skip = (page - 1) * limit;
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit });
  }

  async countAll(): Promise<number> {
    return this.prisma.user.count();
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.password ?? '',
        balance: input.initialBalance ?? 0,
      },
    });
  }

  async updateProfile(id: string, data: UpdateUserInput): Promise<UserEntity> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async updateBalance(id: string, newBalance: number): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data: { balance: newBalance },
    });
  }
}
