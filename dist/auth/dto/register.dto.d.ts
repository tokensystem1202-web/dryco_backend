import { UserRole } from '../roles.enum';
export declare class RegisterDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    city?: string;
}
