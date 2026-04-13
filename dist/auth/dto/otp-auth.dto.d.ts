import { RegisterDto } from './register.dto';
export declare class LoginWithOtpDto {
    recipient: string;
    otp: string;
}
export declare class RegisterWithOtpDto extends RegisterDto {
    otp: string;
    recipient: string;
}
