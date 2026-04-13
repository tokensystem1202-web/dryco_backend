import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessEntity, CouponEntity } from '../database/entities';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

@Module({
  imports: [TypeOrmModule.forFeature([CouponEntity, BusinessEntity])],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
