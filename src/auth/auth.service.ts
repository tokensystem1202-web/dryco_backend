import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { OtpVerificationEntity, UserEntity } from '../database/entities';
import { AuthenticatedUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { LoginWithOtpDto, RegisterWithOtpDto } from './dto/otp-auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(OtpVerificationEntity)
    private readonly otpRepository: Repository<OtpVerificationEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase().trim(), isActive: true },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return this.toAuthenticatedUser(user);
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedPhone = dto.phone.trim();

    const existingUser = await this.usersRepository.findOne({
      where: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      throw new ConflictException('Email or phone is already registered');
    }

    const savedUser = await this.usersRepository.save(
      this.usersRepository.create({
        name: dto.name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash: await hash(dto.password, 10),
        role: dto.role,
        city: dto.city?.trim() || null,
        isActive: true,
      }),
    );

    const user = this.toAuthenticatedUser(savedUser);

    return {
      user,
      tokens: await this.buildTokens(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user,
      tokens: await this.buildTokens(user),
    };
  }

  async registerWithOtp(dto: RegisterWithOtpDto) {
    const recipient = this.normalizeRecipient(dto.recipient);
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedPhone = dto.phone.trim();

    if (![normalizedEmail, normalizedPhone.toLowerCase()].includes(recipient)) {
      throw new BadRequestException('OTP recipient must match the email or phone used for signup');
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

  async loginWithOtp(dto: LoginWithOtpDto) {
    const recipient = this.normalizeRecipient(dto.recipient);
    const userEntity = await this.usersRepository.findOne({
      where: [
        { email: recipient, isActive: true },
        { phone: dto.recipient.trim(), isActive: true },
      ],
    });

    if (!userEntity) {
      throw new UnauthorizedException('No active account found for this recipient');
    }

    await this.consumeOtp(recipient, dto.otp);
    const user = this.toAuthenticatedUser(userEntity);

    return {
      user,
      tokens: await this.buildTokens(user),
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const payload = this.jwtService.verify(dto.refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'washflow_refresh_secret'),
    });

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET', 'washflow_access_secret'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
    };
  }

  logout() {
    return { success: true };
  }

  async sendOtp(dto: SendOtpDto) {
    const otp = randomInt(100000, 999999).toString();

    await this.otpRepository.save(
      this.otpRepository.create({
        recipient: dto.recipient.trim().toLowerCase(),
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
      }),
    );

    return {
      recipient: dto.recipient,
      channel: dto.channel,
      expiresInMinutes: 10,
      otp,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    await this.consumeOtp(dto.recipient, dto.otp);

    return {
      recipient: dto.recipient,
      verified: true,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase().trim(), isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = randomBytes(24).toString('hex');
    await this.otpRepository.save(
      this.otpRepository.create({
        recipient: `reset:${user.email}`,
        otp: resetToken,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        isUsed: false,
      }),
    );

    return {
      email: user.email,
      resetLinkSent: true,
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetRecord = await this.otpRepository.findOne({
      where: { otp: dto.token, isUsed: false },
    });

    if (!resetRecord || !resetRecord.recipient.startsWith('reset:')) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Reset token expired');
    }

    const user = await this.usersRepository.findOne({
      where: { email: resetRecord.recipient.replace(/^reset:/, '') },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await hash(dto.newPassword, 10);
    await this.usersRepository.save(user);

    resetRecord.isUsed = true;
    await this.otpRepository.save(resetRecord);

    return {
      reset: true,
      passwordUpdatedAt: new Date().toISOString(),
    };
  }

  async me(user: AuthenticatedUser) {
    const existingUser = await this.usersRepository.findOne({
      where: { id: user.userId, isActive: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return this.toAuthenticatedUser(existingUser);
  }

  async ensureAdminAccount(email: string, password: string, name = 'DryCo Admin') {
    const normalizedEmail = email.toLowerCase().trim();

    let adminUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!adminUser) {
      adminUser = await this.usersRepository.save(
        this.usersRepository.create({
          name,
          email: normalizedEmail,
          phone: this.buildAdminPhone(normalizedEmail),
          passwordHash: await hash(password, 10),
          role: 'admin',
          isActive: true,
        }),
      );

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

    const passwordMatches = await compare(password, adminUser.passwordHash);
    if (!passwordMatches) {
      adminUser.passwordHash = await hash(password, 10);
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

  private async buildTokens(user: AuthenticatedUser) {
    const accessToken = await this.jwtService.signAsync(user, {
      secret: this.configService.get<string>('JWT_SECRET', 'washflow_access_secret'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(user, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'washflow_refresh_secret'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }

  private async consumeOtp(recipient: string, otp: string) {
    const record = await this.otpRepository.findOne({
      where: {
        recipient: this.normalizeRecipient(recipient),
        otp,
        isUsed: false,
      },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    record.isUsed = true;
    await this.otpRepository.save(record);

    return record;
  }

  private normalizeRecipient(recipient: string) {
    return recipient.trim().toLowerCase();
  }

  private buildAdminPhone(email: string) {
    const digits = email.replace(/\D/g, '');
    const suffix = (digits || '7718000000').slice(-10).padStart(10, '7');
    return suffix;
  }

  private toAuthenticatedUser(user: UserEntity): AuthenticatedUser {
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthenticatedUser['role'],
    };
  }
}
