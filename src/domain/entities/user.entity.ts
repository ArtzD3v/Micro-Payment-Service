export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional so we can omit it in responses if needed
  bio?: string | null;
  avatarUrl?: string | null;
  /** Balance stored in cents (integer). R$10,50 = 1050 */
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  /** Initial balance in cents */
  initialBalance?: number;
}

export interface UpdateUserInput {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}
