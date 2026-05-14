import { PrismaClient } from '@prisma/client';
import { ITransferUseCase, TransferDTO } from '../../domain/interfaces/use-cases/transfer.use-case.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { TransactionEntity, TransactionType } from '../../domain/entities/transaction.entity';
import { UserNotFoundError, InvalidAmountError } from './deposit.use-case';

export class InsufficientFundsError extends Error {
  constructor(available: number, required: number) {
    super(
      `Insufficient funds. Available: ${available} cents (R$ ${(available / 100).toFixed(2)}), ` +
      `Required: ${required} cents (R$ ${(required / 100).toFixed(2)}).`
    );
    this.name = 'InsufficientFundsError';
  }
}

export class SelfTransferError extends Error {
  constructor() {
    super('Sender and receiver cannot be the same user.');
    this.name = 'SelfTransferError';
  }
}

export class TransferUseCase implements ITransferUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(dto: TransferDTO): Promise<TransactionEntity> {
    if (!Number.isInteger(dto.amount) || dto.amount <= 0) {
      throw new InvalidAmountError();
    }

    if (dto.senderId === dto.receiverId) {
      throw new SelfTransferError();
    }

    const [sender, receiver] = await Promise.all([
      this.userRepository.findById(dto.senderId),
      this.userRepository.findById(dto.receiverId),
    ]);

    if (!sender) throw new UserNotFoundError(dto.senderId);
    if (!receiver) throw new UserNotFoundError(dto.receiverId);

    if (sender.balance < dto.amount) {
      throw new InsufficientFundsError(sender.balance, dto.amount);
    }

    // Atomic transaction: debit sender + credit receiver + create transaction record
    // Uses prisma.$transaction to guarantee all-or-nothing execution
    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          amount: dto.amount,
          type: TransactionType.TRANSFER,
          description: dto.description ?? 'Transfer',
          senderId: dto.senderId,
          receiverId: dto.receiverId,
        },
      }),
      this.prisma.user.update({
        where: { id: dto.senderId },
        data: { balance: { decrement: dto.amount } },
      }),
      this.prisma.user.update({
        where: { id: dto.receiverId },
        data: { balance: { increment: dto.amount } },
      }),
    ]);

    return transaction;
  }
}
