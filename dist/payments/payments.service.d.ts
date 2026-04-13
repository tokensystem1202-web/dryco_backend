import { AuthenticatedUser } from '../auth/auth.types';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/payment.dto';
export declare class PaymentsService {
    createOrder(dto: CreatePaymentOrderDto): {
        gateway: "razorpay" | "stripe";
        gatewayOrderId: string;
        amount: number;
        currency: string;
        orderId: string;
    };
    verify(dto: VerifyPaymentDto): {
        orderId: string;
        paymentId: string;
        signature: string;
        verified: boolean;
    };
    history(user: AuthenticatedUser): {
        customerId: string;
        items: {
            paymentId: string;
            amount: number;
            status: string;
        }[];
    };
    refund(orderId: string): {
        orderId: string;
        refunded: boolean;
        refundReference: string;
    };
}
