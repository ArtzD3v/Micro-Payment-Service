import { TransactionEntity } from '../../entities/transaction.entity';

export interface DepositDTO {
  userId: string;
  /** Amount to deposit in cents */
  amount: number;
  description?: string;
}

export interface IDepositUseCase {
  execute(dto: DepositDTO): Promise<TransactionEntity>;
}
