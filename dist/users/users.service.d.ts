import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { NotificationEntity, UserEntity } from '../database/entities';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private readonly usersRepository;
    private readonly notificationsRepository;
    constructor(usersRepository: Repository<UserEntity>, notificationsRepository: Repository<NotificationEntity>);
    getProfile(user: AuthenticatedUser): Promise<{
        name: string;
        email: string;
        phone: string;
        role: "customer" | "business" | "admin";
        profileImage?: string;
        address?: string;
        city?: string;
        pincode?: string;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt?: Date;
    }>;
    updateProfile(user: AuthenticatedUser, dto: UpdateProfileDto, profileImage?: string): Promise<{
        name: string;
        email: string;
        phone: string;
        role: "customer" | "business" | "admin";
        profileImage?: string;
        address?: string;
        city?: string;
        pincode?: string;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt?: Date;
    }>;
    deactivateAccount(user: AuthenticatedUser): Promise<{
        userId: string;
        isActive: boolean;
    }>;
    getNotifications(user: AuthenticatedUser): Promise<NotificationEntity[]>;
    markNotificationAsRead(id: string): Promise<NotificationEntity>;
    private sanitizeUser;
}
