import { NotificationType } from '../../database/entities/washflow.entity';
export declare class SendNotificationDto {
    userId?: string;
    title: string;
    message: string;
    type: NotificationType;
}
