import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles(UserRole.CUSTOMER)
  @Post('create-order')
  createOrder(@Body() dto: CreatePaymentOrderDto) {
    return this.paymentsService.createOrder(dto);
  }

  @Roles(UserRole.CUSTOMER)
  @Post('verify')
  verify(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verify(dto);
  }

  @Roles(UserRole.CUSTOMER)
  @Get('history')
  history(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.history(user);
  }

  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @Post('refund/:orderId')
  refund(@Param('orderId') orderId: string) {
    return this.paymentsService.refund(orderId);
  }
}
