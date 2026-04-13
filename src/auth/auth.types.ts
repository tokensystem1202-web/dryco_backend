import { UserRole } from './roles.enum';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface JwtPayload extends AuthenticatedUser {}
