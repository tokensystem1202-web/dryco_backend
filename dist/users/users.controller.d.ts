import { AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    updateProfile(user: AuthenticatedUser, dto: UpdateProfileDto, file?: {
        filename?: string;
    }): Promise<{
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
    deleteAccount(user: AuthenticatedUser): Promise<{
        userId: string;
        isActive: boolean;
    }>;
    getNotifications(user: AuthenticatedUser): Promise<import("../database/entities").NotificationEntity[]>;
    markNotificationAsRead(id: string): Promise<import("../database/entities").NotificationEntity>;
}
