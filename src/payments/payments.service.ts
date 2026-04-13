import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  createOrder(dto: CreatePaymentOrderDto) {
    return {
      gateway: dto.gateway,
      gatewayOrderId: `${dto.gateway}_order_${Date.now()}`,
      amount: dto.amount,
      currency: 'INR',
      orderId: dto.orderId,
    };
  }

  verify(dto: VerifyPaymentDto) {
    return {
      verified: true,
      ...dto,
    };
  }

  history(user: AuthenticatedUser) {
    return {
      customerId: user.userId,
      items: [{ paymentId: 'pay_123', amount: 799, status: 'paid' }],
    };
  }

  refund(orderId: string) {
    return {
      orderId,
      refunded: true,
      refundReference: `refund_${Date.now()}`,
    };
  }
}
