import { PrismaClient } from '@prisma/client';
import { IDepositUseCase, DepositDTO } from '../../domain/interfaces/use-cases/deposit.use-case.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { TransactionEntity, TransactionType } from '../../domain/entities/transaction.entity';

export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with id '${userId}' not found.`);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidAmountError extends Error {
  constructor() {
    super('Amount must be a positive integer (in cents). Minimum: 1 cent.');
    this.name = 'InvalidAmountError';
  }
}

export class DepositUseCase implements IDepositUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(dto: DepositDTO): Promise<TransactionEntity> {
    if (!Number.isInteger(dto.amount) || dto.amount <= 0) {
      throw new InvalidAmountError();
    }

    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new UserNotFoundError(dto.userId);
    }

    // Atomic transaction: update balance + create transaction record simultaneously
    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          amount: dto.amount,
          type: TransactionType.DEPOSIT,
          description: dto.description ?? 'Deposit',
          receiverId: dto.userId,
          senderId: null,
        },
      }),
      this.prisma.user.update({
        where: { id: dto.userId },
        data: { balance: { increment: dto.amount } },
      }),
    ]);

    return transaction;
  }
}
