import { TransactionEntity, CreateTransactionInput } from '../../entities/transaction.entity';

export interface ITransactionRepository {
  findById(id: string): Promise<TransactionEntity | null>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<TransactionEntity[]>;
  countByUserId(userId: string): Promise<number>;
  create(input: CreateTransactionInput): Promise<TransactionEntity>;
}
