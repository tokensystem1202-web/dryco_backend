import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { NotificationEntity, UserEntity } from '../database/entities';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepository: Repository<NotificationEntity>,
  ) {}

  async getProfile(user: AuthenticatedUser) {
    const currentUser = await this.usersRepository.findOne({ where: { id: user.userId } });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(currentUser);
  }

  async updateProfile(
    user: AuthenticatedUser,
    dto: UpdateProfileDto,
    profileImage?: string,
  ) {
    const currentUser = await this.usersRepository.findOne({ where: { id: user.userId } });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    Object.assign(currentUser, dto);
    if (profileImage) {
      currentUser.profileImage = profileImage;
    }

    const savedUser = await this.usersRepository.save(currentUser);
    return this.sanitizeUser(savedUser);
  }

  async deactivateAccount(user: AuthenticatedUser) {
    const currentUser = await this.usersRepository.findOne({ where: { id: user.userId } });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    currentUser.isActive = false;
    await this.usersRepository.save(currentUser);

    return {
      userId: currentUser.id,
      isActive: currentUser.isActive,
    };
  }

  async getNotifications(user: AuthenticatedUser) {
    return this.notificationsRepository.find({
      where: { userId: user.userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markNotificationAsRead(id: string) {
    const notification = await this.notificationsRepository.findOne({ where: { id } });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  private sanitizeUser(user: UserEntity) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
