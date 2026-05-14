import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

export interface UpdateProfileDTO {
  userId: string;
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User with ID ${id} not found.`);
    this.name = 'UserNotFoundError';
  }
}

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: UpdateProfileDTO): Promise<UserEntity> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new UserNotFoundError(dto.userId);
    }

    return this.userRepository.updateProfile(dto.userId, {
      name: dto.name,
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
    });
  }
}
