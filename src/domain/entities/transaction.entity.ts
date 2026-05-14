import { TransactionType, TransactionStatus } from '@prisma/client';

export { TransactionType, TransactionStatus };

export interface TransactionEntity {
  id: string;
  /** Amount in cents (integer). R$10,50 = 1050 */
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  senderId: string | null;
  receiverId: string;
  createdAt: Date;
}

export interface CreateTransactionInput {
  /** Amount in cents */
  amount: number;
  type: TransactionType;
  description?: string;
  senderId?: string;
  receiverId: string;
}
