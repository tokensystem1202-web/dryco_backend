import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { SendNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  send(dto: SendNotificationDto) {
    return {
      delivered: true,
      audience: dto.userId ?? 'all',
      ...dto,
    };
  }

  myNotifications(user: AuthenticatedUser) {
    return [
      {
        id: 'notif-1',
        userId: user.userId,
        title: 'Promo applied',
        message: 'SAVE20 coupon applied on your order.',
        isRead: false,
      },
    ];
  }

  markRead(id: string) {
    return { id, isRead: true };
  }

  remove(id: string) {
    return { id, deleted: true };
  }
}
