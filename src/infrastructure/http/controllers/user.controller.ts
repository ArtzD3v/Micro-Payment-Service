import { Request, Response } from 'express';
import { ICreateUserUseCase } from '../../../domain/interfaces/use-cases/create-user.use-case.interface';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { UpdateProfileUseCase } from '../../../application/use-cases/update-profile.use-case';
import { createUserSchema, loginSchema, updateProfileSchema } from '../validators/user.validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ZodError } from 'zod';

export class UserController {
  constructor(
    private readonly createUserUseCase: ICreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly userRepository: IUserRepository,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createUserSchema.parse(req.body);

    const user = await this.createUserUseCase.execute({
      name: parsed.name,
      email: parsed.email,
      password: parsed.password,
      initialBalance: parsed.initialBalance,
    });

    const { password, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        ...userWithoutPassword,
        balanceFormatted: `R$ ${(user.balance / 100).toFixed(2)}`,
      },
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.parse(req.body);

    const { user, token } = await this.loginUseCase.execute({
      email: parsed.email,
      password: parsed.password,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          balanceFormatted: `R$ ${(user.balance / 100).toFixed(2)}`,
        },
        token,
      },
    });
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const [users, total] = await Promise.all([
      this.userRepository.findAll(page, limit),
      this.userRepository.countAll(),
    ]);

    res.status(200).json({
      success: true,
      data: users.map((u) => {
        const { password, ...userWithoutPassword } = u;
        return {
          ...userWithoutPassword,
          balanceFormatted: `R$ ${(u.balance / 100).toFixed(2)}`,
        };
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async getMe(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user!.userId;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'UserNotFound' });
      return;
    }

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        balanceFormatted: `R$ ${(user.balance / 100).toFixed(2)}`,
      },
    });
  }

  async updateMe(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user!.userId;
    const parsed = updateProfileSchema.parse(req.body);

    const user = await this.updateProfileUseCase.execute({
      userId,
      ...parsed,
    });

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        balanceFormatted: `R$ ${(user.balance / 100).toFixed(2)}`,
      },
    });
  }

  async findById(req: Request, res: Response): Promise<void> {
    const user = await this.userRepository.findById(req.params.id);

    if (!user) {
      res.status(404).json({ success: false, message: `User '${req.params.id}' not found.` });
      return;
    }

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        balanceFormatted: `R$ ${(user.balance / 100).toFixed(2)}`,
      },
    });
  }
}
