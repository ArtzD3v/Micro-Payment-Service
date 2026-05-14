import { UserEntity } from '../../entities/user.entity';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  /** Optional initial balance in cents */
  initialBalance?: number;
}

export interface ICreateUserUseCase {
  execute(dto: CreateUserDTO): Promise<UserEntity>;
}
