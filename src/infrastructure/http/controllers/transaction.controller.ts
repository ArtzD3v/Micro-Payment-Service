import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { IDepositUseCase } from '../../../domain/interfaces/use-cases/deposit.use-case.interface';
import { ITransferUseCase } from '../../../domain/interfaces/use-cases/transfer.use-case.interface';
import { ITransactionRepository } from '../../../domain/interfaces/repositories/transaction.repository.interface';
import { depositSchema, transferSchema } from '../validators/transaction.validator';

export class TransactionController {
  constructor(
    private readonly depositUseCase: IDepositUseCase,
    private readonly transferUseCase: ITransferUseCase,
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async deposit(req: Request, res: Response): Promise<void> {
    const parsed = depositSchema.parse(req.body);
    const userId = (req as AuthRequest).user!.userId;

    const transaction = await this.depositUseCase.execute({
      userId: userId,
      amount: parsed.amount,
      description: parsed.description,
    });

    res.status(201).json({
      success: true,
      data: {
        ...transaction,
        amountFormatted: `R$ ${(transaction.amount / 100).toFixed(2)}`,
      },
    });
  }

  async transfer(req: Request, res: Response): Promise<void> {
    const parsed = transferSchema.parse(req.body);
    const senderId = (req as AuthRequest).user!.userId;

    const transaction = await this.transferUseCase.execute({
      senderId: senderId,
      receiverId: parsed.receiverId,
      amount: parsed.amount,
      description: parsed.description,
    });

    res.status(201).json({
      success: true,
      data: {
        ...transaction,
        amountFormatted: `R$ ${(transaction.amount / 100).toFixed(2)}`,
      },
    });
  }

  async findByUserId(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const [transactions, total] = await Promise.all([
      this.transactionRepository.findByUserId(userId, page, limit),
      this.transactionRepository.countByUserId(userId),
    ]);

    res.status(200).json({
      success: true,
      data: transactions.map((t) => ({
        ...t,
        amountFormatted: `R$ ${(t.amount / 100).toFixed(2)}`,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async findById(req: Request, res: Response): Promise<void> {
    const transaction = await this.transactionRepository.findById(req.params.id);

    if (!transaction) {
      res.status(404).json({ success: false, message: `Transaction '${req.params.id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        ...transaction,
        amountFormatted: `R$ ${(transaction.amount / 100).toFixed(2)}`,
      },
    });
  }
}
