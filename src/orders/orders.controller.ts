import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AssignRiderDto, CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRole.CUSTOMER)
  @Post('orders')
  createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user, dto);
  }

  @Roles(UserRole.CUSTOMER)
  @Get('orders')
  getCustomerOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.getCustomerOrders(user);
  }

  @Roles(UserRole.CUSTOMER)
  @Get('orders/:id')
  getOrderDetails(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.ordersService.getOrderDetails(user, id);
  }

  @Roles(UserRole.CUSTOMER)
  @Post('orders/:id/cancel')
  cancelOrder(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.ordersService.cancelOrder(user, id);
  }

  @Roles(UserRole.CUSTOMER)
  @Post('orders/:id/reorder')
  reorder(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.ordersService.reorder(user, id);
  }

  @Roles(UserRole.BUSINESS)
  @Get('business/orders')
  getBusinessOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: Record<string, string | undefined>,
  ) {
    return this.ordersService.getBusinessOrders(user, query);
  }

  @Roles(UserRole.BUSINESS)
  @Patch('business/orders/:id/status')
  updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(user, id, dto);
  }

  @Roles(UserRole.BUSINESS)
  @Patch('orders/:id/status')
  updateOrderStatusAlias(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(user, id, dto);
  }

  @Roles(UserRole.BUSINESS)
  @Patch('business/orders/:id/assign-rider')
  assignRider(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignRiderDto,
  ) {
    return this.ordersService.assignRider(user, id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin/orders')
  adminListOrders(@Query() query: Record<string, string | undefined>) {
    return this.ordersService.adminListOrders(query);
  }
}
