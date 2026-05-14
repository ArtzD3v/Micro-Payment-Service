import { Router } from 'express';
import prisma from '../database/prisma.client';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { PrismaTransactionRepository } from '../repositories/prisma-transaction.repository';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { DepositUseCase } from '../../application/use-cases/deposit.use-case';
import { TransferUseCase } from '../../application/use-cases/transfer.use-case';
import { UserController } from './controllers/user.controller';
import { TransactionController } from './controllers/transaction.controller';
import { ChatController } from './controllers/chat.controller';
import { authMiddleware } from './middlewares/auth.middleware';

const router = Router();

// ── Dependency Injection (manual, no IoC container) ─────────────────────────
const userRepository = new PrismaUserRepository(prisma);
const transactionRepository = new PrismaTransactionRepository(prisma);

const createUserUseCase = new CreateUserUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const depositUseCase = new DepositUseCase(userRepository, prisma);
const transferUseCase = new TransferUseCase(userRepository, prisma);

const userController = new UserController(createUserUseCase, loginUseCase, updateProfileUseCase, userRepository);
const transactionController = new TransactionController(
  depositUseCase,
  transferUseCase,
  transactionRepository,
);
const chatController = new ChatController();

// ── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Users & Auth ──────────────────────────────────────────────────────────────
// POST   /api/v1/users         → Create a new user
// POST   /api/v1/auth/login    → Authenticate user
// GET    /api/v1/users/me      → Get current user
// PUT    /api/v1/users/me      → Update current user profile
// GET    /api/v1/users         → List all users
// GET    /api/v1/users/:id     → Get user by ID
router.post('/users', (req, res, next) =>
  userController.create(req, res).catch(next),
);
router.post('/auth/login', (req, res, next) =>
  userController.login(req, res).catch(next),
);
router.get('/users/me', authMiddleware, (req, res, next) =>
  userController.getMe(req, res).catch(next),
);
router.put('/users/me', authMiddleware, (req, res, next) =>
  userController.updateMe(req, res).catch(next),
);
router.get('/users', authMiddleware, (req, res, next) =>
  userController.findAll(req, res).catch(next),
);
router.get('/users/:id', authMiddleware, (req, res, next) =>
  userController.findById(req, res).catch(next),
);

// ── Transactions ──────────────────────────────────────────────────────────────
// POST   /api/v1/transactions/deposit    → Deposit funds
// POST   /api/v1/transactions/transfer   → Transfer between users
// GET    /api/v1/transactions/user/:userId → List user's transactions
// GET    /api/v1/transactions/:id        → Get transaction by ID
router.post('/transactions/deposit', authMiddleware, (req, res, next) =>
  transactionController.deposit(req, res).catch(next),
);
router.post('/transactions/transfer', authMiddleware, (req, res, next) =>
  transactionController.transfer(req, res).catch(next),
);
router.get('/transactions/user/:userId', authMiddleware, (req, res, next) =>
  transactionController.findByUserId(req, res).catch(next),
);
router.get('/transactions/:id', authMiddleware, (req, res, next) =>
  transactionController.findById(req, res).catch(next),
);

// ── AI Assistant ──────────────────────────────────────────────────────────────
router.post('/chat', authMiddleware, (req, res, next) =>
  chatController.handle(req, res).catch(next),
);

export default router;
