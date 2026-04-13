export declare class CreatePaymentOrderDto {
    orderId: string;
    amount: number;
    gateway: 'razorpay' | 'stripe';
}
export declare class VerifyPaymentDto {
    orderId: string;
    paymentId: string;
    signature: string;
}
