import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

export interface LoginDTO {
  email: string;
  password?: string;
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: LoginDTO): Promise<{ user: UserEntity; token: string }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (dto.password) {
      const isPasswordValid = await bcrypt.compare(dto.password, user.password || '');
      if (!isPasswordValid) {
        throw new InvalidCredentialsError();
      }
    }

    const jwtSecret = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1d' });

    // Remove password before returning
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return { user: userWithoutPassword, token };
  }
}
