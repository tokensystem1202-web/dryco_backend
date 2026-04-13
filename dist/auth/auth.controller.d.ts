import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginWithOtpDto, RegisterWithOtpDto } from './dto/otp-auth.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: import("./auth.types").AuthenticatedUser;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        user: import("./auth.types").AuthenticatedUser;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    registerWithOtp(dto: RegisterWithOtpDto): Promise<{
        user: import("./auth.types").AuthenticatedUser;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    loginWithOtp(dto: LoginWithOtpDto): Promise<{
        user: import("./auth.types").AuthenticatedUser;
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
    me(user: unknown): Promise<import("./auth.types").AuthenticatedUser>;
}
