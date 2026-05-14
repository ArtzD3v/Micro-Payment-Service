import { TransactionEntity } from '../../entities/transaction.entity';

export interface TransferDTO {
  senderId: string;
  receiverId: string;
  /** Amount to transfer in cents */
  amount: number;
  description?: string;
}

export interface ITransferUseCase {
  execute(dto: TransferDTO): Promise<TransactionEntity>;
}
