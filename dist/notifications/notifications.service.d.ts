import { AuthenticatedUser } from '../auth/auth.types';
import { SendNotificationDto } from './dto/notification.dto';
export declare class NotificationsService {
    send(dto: SendNotificationDto): {
        userId?: string;
        title: string;
        message: string;
        type: import("../database/entities/washflow.entity").NotificationType;
        delivered: boolean;
        audience: string;
    };
    myNotifications(user: AuthenticatedUser): {
        id: string;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }[];
    markRead(id: string): {
        id: string;
        isRead: boolean;
    };
    remove(id: string): {
        id: string;
        deleted: boolean;
    };
}
