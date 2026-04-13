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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcryptjs_1 = require("bcryptjs");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let AuthService = class AuthService {
    constructor(usersRepository, otpRepository, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.otpRepository = otpRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, password) {
        const user = await this.usersRepository.findOne({
            where: { email: email.toLowerCase().trim(), isActive: true },
        });
        if (!user) {
            return null;
        }
        const isPasswordValid = await (0, bcryptjs_1.compare)(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }
        return this.toAuthenticatedUser(user);
    }
    async register(dto) {
        const normalizedEmail = dto.email.toLowerCase().trim();
        const normalizedPhone = dto.phone.trim();
        const existingUser = await this.usersRepository.findOne({
            where: [{ email: normalizedEmail }, { phone: normalizedPhone }],
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email or phone is already registered');
        }
        const savedUser = await this.usersRepository.save(this.usersRepository.create({
            name: dto.name.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            passwordHash: await (0, bcryptjs_1.hash)(dto.password, 10),
            role: dto.role,
            city: dto.city?.trim() || null,
            isActive: true,
        }));
        const user = this.toAuthenticatedUser(savedUser);
        return {
            user,
            tokens: await this.buildTokens(user),
        };
    }
    async login(dto) {
        const user = await this.validateUser(dto.email, dto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return {
            user,
            tokens: await this.buildTokens(user),
        };
    }
    async registerWithOtp(dto) {
        const recipient = this.normalizeRecipient(dto.recipient);
        const normalizedEmail = dto.email.toLowerCase().trim();
        const normalizedPhone = dto.phone.trim();
        if (![normalizedEmail, normalizedPhone.toLowerCase()].includes(recipient)) {
            throw new common_1.BadRequestException('OTP recipient must match the email or phone used for signup');
        }
        await this.consumeOtp(recipient, dto.otp);
        return this.register({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            password: dto.password,
            role: dto.role,
            city: dto.city,
        });
    }
    async loginWithOtp(dto) {
        const recipient = this.normalizeRecipient(dto.recipient);
        const userEntity = await this.usersRepository.findOne({
            where: [
                { email: recipient, isActive: true },
                { phone: dto.recipient.trim(), isActive: true },
            ],
        });
        if (!userEntity) {
            throw new common_1.UnauthorizedException('No active account found for this recipient');
        }
        await this.consumeOtp(recipient, dto.otp);
        const user = this.toAuthenticatedUser(userEntity);
        return {
            user,
            tokens: await this.buildTokens(user),
        };
    }
    async refreshToken(dto) {
        const payload = this.jwtService.verify(dto.refreshToken, {
            secret: this.configService.get('JWT_REFRESH_SECRET', 'washflow_refresh_secret'),
        });
        return {
            accessToken: await this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET', 'washflow_access_secret'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
            }),
        };
    }
    logout() {
        return { success: true };
    }
    async sendOtp(dto) {
        const otp = (0, crypto_1.randomInt)(100000, 999999).toString();
        await this.otpRepository.save(this.otpRepository.create({
            recipient: dto.recipient.trim().toLowerCase(),
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            isUsed: false,
        }));
        return {
            recipient: dto.recipient,
            channel: dto.channel,
            expiresInMinutes: 10,
            otp,
        };
    }
    async verifyOtp(dto) {
        await this.consumeOtp(dto.recipient, dto.otp);
        return {
            recipient: dto.recipient,
            verified: true,
        };
    }
    async forgotPassword(dto) {
        const user = await this.usersRepository.findOne({
            where: { email: dto.email.toLowerCase().trim(), isActive: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const resetToken = (0, crypto_1.randomBytes)(24).toString('hex');
        await this.otpRepository.save(this.otpRepository.create({
            recipient: `reset:${user.email}`,
            otp: resetToken,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            isUsed: false,
        }));
        return {
            email: user.email,
            resetLinkSent: true,
            resetToken,
        };
    }
    async resetPassword(dto) {
        const resetRecord = await this.otpRepository.findOne({
            where: { otp: dto.token, isUsed: false },
        });
        if (!resetRecord || !resetRecord.recipient.startsWith('reset:')) {
            throw new common_1.BadRequestException('Invalid reset token');
        }
        if (resetRecord.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Reset token expired');
        }
        const user = await this.usersRepository.findOne({
            where: { email: resetRecord.recipient.replace(/^reset:/, '') },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.passwordHash = await (0, bcryptjs_1.hash)(dto.newPassword, 10);
        await this.usersRepository.save(user);
        resetRecord.isUsed = true;
        await this.otpRepository.save(resetRecord);
        return {
            reset: true,
            passwordUpdatedAt: new Date().toISOString(),
        };
    }
    async me(user) {
        const existingUser = await this.usersRepository.findOne({
            where: { id: user.userId, isActive: true },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.toAuthenticatedUser(existingUser);
    }
    async ensureAdminAccount(email, password, name = 'DryCo Admin') {
        const normalizedEmail = email.toLowerCase().trim();
        let adminUser = await this.usersRepository.findOne({
            where: { email: normalizedEmail },
        });
        if (!adminUser) {
            adminUser = await this.usersRepository.save(this.usersRepository.create({
                name,
                email: normalizedEmail,
                phone: this.buildAdminPhone(normalizedEmail),
                passwordHash: await (0, bcryptjs_1.hash)(password, 10),
                role: 'admin',
                isActive: true,
            }));
            return {
                created: true,
                updated: false,
                email: adminUser.email,
            };
        }
        let shouldUpdate = false;
        if (adminUser.role !== 'admin') {
            adminUser.role = 'admin';
            shouldUpdate = true;
        }
        if (!adminUser.isActive) {
            adminUser.isActive = true;
            shouldUpdate = true;
        }
        const passwordMatches = await (0, bcryptjs_1.compare)(password, adminUser.passwordHash);
        if (!passwordMatches) {
            adminUser.passwordHash = await (0, bcryptjs_1.hash)(password, 10);
            shouldUpdate = true;
        }
        if (shouldUpdate) {
            await this.usersRepository.save(adminUser);
        }
        return {
            created: false,
            updated: shouldUpdate,
            email: adminUser.email,
        };
    }
    async buildTokens(user) {
        const accessToken = await this.jwtService.signAsync(user, {
            secret: this.configService.get('JWT_SECRET', 'washflow_access_secret'),
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
        });
        const refreshToken = await this.jwtService.signAsync(user, {
            secret: this.configService.get('JWT_REFRESH_SECRET', 'washflow_refresh_secret'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });
        return { accessToken, refreshToken };
    }
    async consumeOtp(recipient, otp) {
        const record = await this.otpRepository.findOne({
            where: {
                recipient: this.normalizeRecipient(recipient),
                otp,
                isUsed: false,
            },
        });
        if (!record || record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        record.isUsed = true;
        await this.otpRepository.save(record);
        return record;
    }
    normalizeRecipient(recipient) {
        return recipient.trim().toLowerCase();
    }
    buildAdminPhone(email) {
        const digits = email.replace(/\D/g, '');
        const suffix = (digits || '7718000000').slice(-10).padStart(10, '7');
        return suffix;
    }
    toAuthenticatedUser(user) {
        return {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.OtpVerificationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map