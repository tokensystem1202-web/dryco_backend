export declare class SendOtpDto {
    channel: 'phone' | 'email';
    recipient: string;
}
export declare class VerifyOtpDto extends SendOtpDto {
    otp: string;
}
