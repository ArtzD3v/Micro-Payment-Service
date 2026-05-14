import { ICreateUserUseCase, CreateUserDTO } from '../../domain/interfaces/use-cases/create-user.use-case.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import bcrypt from 'bcrypt';

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`User with email '${email}' already exists.`);
    this.name = 'DuplicateEmailError';
  }
}

export class InvalidBalanceError extends Error {
  constructor() {
    super('Initial balance must be a non-negative integer (in cents).');
    this.name = 'InvalidBalanceError';
  }
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDTO): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new DuplicateEmailError(dto.email);
    }

    if (dto.initialBalance !== undefined && dto.initialBalance < 0) {
      throw new InvalidBalanceError();
    }

    const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : '';

    return this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      initialBalance: dto.initialBalance ?? 0,
    });
  }
}
