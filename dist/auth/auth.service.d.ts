import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { OtpVerificationEntity, UserEntity } from '../database/entities';
import { AuthenticatedUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
export declare class AuthService {
    private readonly usersRepository;
    private readonly otpRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(usersRepository: Repository<UserEntity>, otpRepository: Repository<OtpVerificationEntity>, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<AuthenticatedUser>;
    register(dto: RegisterDto): Promise<{
        user: AuthenticatedUser;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        user: AuthenticatedUser;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    logout(): {
        success: boolean;
    };
    sendOtp(dto: SendOtpDto): Promise<{
        recipient: string;
        channel: "phone" | "email";
        expiresInMinutes: number;
        otp: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        recipient: string;
        verified: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        email: string;
        resetLinkSent: boolean;
        resetToken: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        reset: boolean;
        passwordUpdatedAt: string;
    }>;
    me(user: AuthenticatedUser): Promise<AuthenticatedUser>;
    private buildTokens;
    private toAuthenticatedUser;
}
