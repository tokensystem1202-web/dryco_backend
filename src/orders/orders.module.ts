import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BusinessEntity,
  CouponEntity,
  NotificationEntity,
  OrderEntity,
  OrderItemEntity,
  RiderEntity,
  ServiceEntity,
  SubscriptionEntity,
} from '../database/entities';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      ServiceEntity,
      BusinessEntity,
      RiderEntity,
      SubscriptionEntity,
      CouponEntity,
      NotificationEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService],
})
export class OrdersModule {}