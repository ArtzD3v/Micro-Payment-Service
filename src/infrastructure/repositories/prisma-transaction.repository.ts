import { PrismaClient } from '@prisma/client';
import { ITransactionRepository } from '../../domain/interfaces/repositories/transaction.repository.interface';
import { TransactionEntity, CreateTransactionInput } from '../../domain/entities/transaction.entity';

export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<TransactionEntity | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  async findByUserId(userId: string, page = 1, limit = 50): Promise<TransactionEntity[]> {
    const skip = (page - 1) * limit;
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }) as Promise<TransactionEntity[]>;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.transaction.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });
  }

  async create(input: CreateTransactionInput): Promise<TransactionEntity> {
    return this.prisma.transaction.create({
      data: {
        amount: input.amount,
        type: input.type,
        description: input.description,
        senderId: input.senderId,
        receiverId: input.receiverId,
      },
    });
  }
}
