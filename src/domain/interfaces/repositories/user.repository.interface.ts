import { UserEntity, CreateUserInput, UpdateUserInput } from '../../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(page?: number, limit?: number): Promise<UserEntity[]>;
  countAll(): Promise<number>;
  create(input: CreateUserInput): Promise<UserEntity>;
  updateProfile(id: string, data: UpdateUserInput): Promise<UserEntity>;
  updateBalance(id: string, newBalance: number): Promise<UserEntity>;
}
