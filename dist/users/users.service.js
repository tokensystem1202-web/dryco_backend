"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let UsersService = class UsersService {
    constructor(usersRepository, notificationsRepository) {
        this.usersRepository = usersRepository;
        this.notificationsRepository = notificationsRepository;
    }
    async getProfile(user) {
        const currentUser = await this.usersRepository.findOne({ where: { id: user.userId } });
        if (!currentUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.sanitizeUser(currentUser);
    }
    async updateProfile(user, dto, profileImage) {
        const currentUser = await this.usersRepository.findOne({ where: { id: user.userId } });
        if (!currentUser) {
            throw new common_1.NotFoundException('User not found');
        }
        Object.assign(currentUser, dto);
        if (profileImage) {
            currentUser.profileImage = profileImage;
        }
        const savedUser = await this.usersRepository.save(currentUser);
        return this.sanitizeUser(savedUser);
    }
    async deactivateAccount(user) {
        const currentUser = await this.usersRepository.findOne({ where: { id: user.userId } });
        if (!currentUser) {
            throw new common_1.NotFoundException('User not found');
        }
        currentUser.isActive = false;
        await this.usersRepository.save(currentUser);
        return {
            userId: currentUser.id,
            isActive: currentUser.isActive,
        };
    }
    async getNotifications(user) {
        return this.notificationsRepository.find({
            where: { userId: user.userId },
            order: { createdAt: 'DESC' },
        });
    }
    async markNotificationAsRead(id) {
        const notification = await this.notificationsRepository.findOne({ where: { id } });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        notification.isRead = true;
        return this.notificationsRepository.save(notification);
    }
    sanitizeUser(user) {
        const { passwordHash: _passwordHash, ...safeUser } = user;
        return safeUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.NotificationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map